"""
This module contains all insights-related routes for the LightRAG API.
Provides analytics and insights from the knowledge graph.
"""

import traceback
from collections import Counter, defaultdict
from typing import Dict, List, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from lightrag import LightRAG
from lightrag.api.utils_api import get_combined_auth_dependency
from lightrag.utils import logger

router = APIRouter(
    prefix="/insights",
    tags=["insights"],
)


class EntityInsight(BaseModel):
    """Insight data for a single entity"""

    name: str = Field(description="Entity name")
    type: str = Field(description="Entity type")
    degree: int = Field(description="Number of connections")
    description: str = Field(description="Entity description")


class RelationshipInsight(BaseModel):
    """Insight data for entity relationships"""

    source: str = Field(description="Source entity")
    target: str = Field(description="Target entity")
    relationship: str = Field(description="Relationship description")
    weight: float = Field(description="Relationship strength")


class GraphStatsResponse(BaseModel):
    """Response model for graph statistics"""

    total_entities: int = Field(description="Total number of entities")
    total_relationships: int = Field(description="Total number of relationships")
    entity_types: Dict[str, int] = Field(description="Count by entity type")
    avg_connections_per_entity: float = Field(
        description="Average connections per entity"
    )
    most_connected_entities: List[EntityInsight] = Field(
        description="Top connected entities"
    )
    strongest_relationships: List[RelationshipInsight] = Field(
        description="Strongest relationships"
    )
    documents_processed: int = Field(description="Number of processed documents")


class TopicCluster(BaseModel):
    """Represents a cluster of related entities/topics"""

    cluster_id: int = Field(description="Cluster identifier")
    entities: List[str] = Field(description="Entities in this cluster")
    central_entity: str = Field(description="Most central entity in cluster")
    topic_keywords: List[str] = Field(description="Key terms representing this topic")
    document_count: int = Field(description="Documents related to this cluster")


class TopicClustersResponse(BaseModel):
    """Response model for topic clustering analysis"""

    clusters: List[TopicCluster] = Field(description="Identified topic clusters")
    total_clusters: int = Field(description="Total number of clusters found")
    coverage_percentage: float = Field(description="Percentage of entities clustered")


class DocumentConnectivityResponse(BaseModel):
    """Response model for document connectivity insights"""

    document_id: str = Field(description="Document identifier")
    entities_mentioned: int = Field(description="Number of entities mentioned")
    relationships_formed: int = Field(description="Number of relationships formed")
    connectivity_score: float = Field(description="Document connectivity score")
    key_entities: List[str] = Field(description="Key entities in document")


class KnowledgeGapResponse(BaseModel):
    """Response model for knowledge gap analysis"""

    isolated_entities: List[EntityInsight] = Field(
        description="Entities with few connections"
    )
    missing_connections: List[Tuple[str, str]] = Field(
        description="Potential missing relationships"
    )
    underrepresented_topics: List[str] = Field(
        description="Topics that need more coverage"
    )


def create_insights_routes(rag: LightRAG, api_key: Optional[str] = None):
    combined_auth = get_combined_auth_dependency(api_key)

    @router.get(
        "/graph-stats",
        response_model=GraphStatsResponse,
        dependencies=[Depends(combined_auth)],
    )
    async def get_graph_statistics():
        """
        Get comprehensive statistics about the knowledge graph.

        Returns detailed analytics including entity counts, relationship metrics,
        and identifies the most connected entities and strongest relationships.

        Returns:
            GraphStatsResponse: Comprehensive graph statistics

        Raises:
            HTTPException: If error occurs while computing statistics (500)
        """
        try:
            # Get all entities and relationships from the graph
            entities_data = await rag.entities_vdb.get_by_ids(
                list(await rag.entities_vdb.index_done_callback())
            )
            relationships_data = await rag.relationships_vdb.get_by_ids(
                list(await rag.relationships_vdb.index_done_callback())
            )

            # Get processed documents count
            processed_docs = await rag.get_docs_by_status("processed")
            documents_processed = len(processed_docs)

            # Calculate entity statistics
            entity_types = Counter()
            entity_connections = defaultdict(int)
            entities_info = {}

            for entity_id, entity_data in entities_data.items():
                if entity_data and "entity_type" in entity_data:
                    entity_type = entity_data.get("entity_type", "unknown")
                    entity_types[entity_type] += 1

                    entities_info[entity_id] = {
                        "name": entity_data.get("entity_name", entity_id),
                        "type": entity_type,
                        "description": entity_data.get("description", ""),
                        "degree": 0,
                    }

            # Calculate relationship statistics
            relationship_strengths = []

            for rel_id, rel_data in relationships_data.items():
                if rel_data:
                    src_id = rel_data.get("src_id", "")
                    tgt_id = rel_data.get("tgt_id", "")
                    weight = rel_data.get("weight", 0.0)

                    # Count connections
                    entity_connections[src_id] += 1
                    entity_connections[tgt_id] += 1

                    # Store relationship info
                    relationship_strengths.append(
                        {
                            "source": entities_info.get(src_id, {}).get("name", src_id),
                            "target": entities_info.get(tgt_id, {}).get("name", tgt_id),
                            "relationship": rel_data.get("description", ""),
                            "weight": weight,
                        }
                    )

            # Update entity degrees
            for entity_id in entities_info:
                entities_info[entity_id]["degree"] = entity_connections[entity_id]

            # Get top connected entities
            most_connected = sorted(
                entities_info.values(), key=lambda x: x["degree"], reverse=True
            )[:10]

            # Get strongest relationships
            strongest_rels = sorted(
                relationship_strengths, key=lambda x: x["weight"], reverse=True
            )[:10]

            # Calculate averages
            total_entities = len(entities_info)
            total_relationships = len(relationship_strengths)
            avg_connections = (
                sum(entity_connections.values()) / total_entities
                if total_entities > 0
                else 0
            )

            return GraphStatsResponse(
                total_entities=total_entities,
                total_relationships=total_relationships,
                entity_types=dict(entity_types),
                avg_connections_per_entity=avg_connections,
                most_connected_entities=[
                    EntityInsight(
                        name=entity["name"],
                        type=entity["type"],
                        degree=entity["degree"],
                        description=entity["description"],
                    )
                    for entity in most_connected
                ],
                strongest_relationships=[
                    RelationshipInsight(**rel) for rel in strongest_rels
                ],
                documents_processed=documents_processed,
            )

        except Exception as e:
            logger.error(f"Error getting graph statistics: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/topic-clusters",
        response_model=TopicClustersResponse,
        dependencies=[Depends(combined_auth)],
    )
    async def get_topic_clusters():
        """
        Analyze the knowledge graph to identify topic clusters.

        Uses entity relationships to group related topics and identify
        central themes in the knowledge base.

        Returns:
            TopicClustersResponse: Identified topic clusters with central entities

        Raises:
            HTTPException: If error occurs during cluster analysis (500)
        """
        try:
            # Get graph data
            entities_data = await rag.entities_vdb.get_by_ids(
                list(await rag.entities_vdb.index_done_callback())
            )
            relationships_data = await rag.relationships_vdb.get_by_ids(
                list(await rag.relationships_vdb.index_done_callback())
            )

            # Build adjacency graph
            graph = defaultdict(set)
            for rel_id, rel_data in relationships_data.items():
                if rel_data:
                    src_id = rel_data.get("src_id", "")
                    tgt_id = rel_data.get("tgt_id", "")
                    if src_id and tgt_id:
                        graph[src_id].add(tgt_id)
                        graph[tgt_id].add(src_id)

            # Simple clustering using connected components
            visited = set()
            clusters = []

            def dfs_cluster(node, cluster):
                if node in visited:
                    return
                visited.add(node)
                cluster.add(node)
                for neighbor in graph[node]:
                    dfs_cluster(neighbor, cluster)

            for entity_id in entities_data.keys():
                if entity_id not in visited:
                    cluster = set()
                    dfs_cluster(entity_id, cluster)
                    if len(cluster) > 1:  # Only include clusters with multiple entities
                        clusters.append(cluster)

            # Analyze clusters
            topic_clusters = []
            for i, cluster in enumerate(clusters[:10]):  # Limit to top 10 clusters
                # Find central entity (most connected within cluster)
                cluster_connections = {
                    entity: len(graph[entity] & cluster) for entity in cluster
                }
                central_entity = max(cluster_connections, key=cluster_connections.get)

                # Get entity names and extract keywords
                entity_names = []
                topic_keywords = []

                for entity_id in cluster:
                    entity_info = entities_data.get(entity_id, {})
                    name = entity_info.get("entity_name", entity_id)
                    entity_names.append(name)

                    # Extract keywords from entity descriptions
                    description = entity_info.get("description", "")
                    if description:
                        words = description.lower().split()
                        topic_keywords.extend([w for w in words if len(w) > 3])

                # Get most common keywords
                keyword_counts = Counter(topic_keywords)
                top_keywords = [word for word, _ in keyword_counts.most_common(5)]

                topic_clusters.append(
                    TopicCluster(
                        cluster_id=i,
                        entities=entity_names,
                        central_entity=entities_data.get(central_entity, {}).get(
                            "entity_name", central_entity
                        ),
                        topic_keywords=top_keywords,
                        document_count=len(
                            [
                                e
                                for e in cluster
                                if "source_id" in entities_data.get(e, {})
                            ]
                        ),
                    )
                )

            total_entities = len(entities_data)
            clustered_entities = sum(len(cluster) for cluster in clusters)
            coverage_percentage = (
                (clustered_entities / total_entities * 100) if total_entities > 0 else 0
            )

            return TopicClustersResponse(
                clusters=topic_clusters,
                total_clusters=len(clusters),
                coverage_percentage=coverage_percentage,
            )

        except Exception as e:
            logger.error(f"Error analyzing topic clusters: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/document-connectivity",
        response_model=List[DocumentConnectivityResponse],
        dependencies=[Depends(combined_auth)],
    )
    async def get_document_connectivity():
        """
        Analyze how well documents are connected in the knowledge graph.

        Identifies documents that contribute most to graph connectivity and
        those that might be isolated or poorly integrated.

        Returns:
            List[DocumentConnectivityResponse]: Document connectivity analysis

        Raises:
            HTTPException: If error occurs during connectivity analysis (500)
        """
        try:
            # Get processed documents
            processed_docs = await rag.get_docs_by_status("processed")

            document_connectivity = []

            for doc_id, doc_status in processed_docs.items():
                # Get entities from this document
                entities_in_doc = []
                relationships_in_doc = []

                # Query entities by source document
                entities_data = await rag.entities_vdb.get_by_ids(
                    list(await rag.entities_vdb.index_done_callback())
                )
                relationships_data = await rag.relationships_vdb.get_by_ids(
                    list(await rag.relationships_vdb.index_done_callback())
                )

                for entity_id, entity_data in entities_data.items():
                    if entity_data and entity_data.get("source_id") == doc_id:
                        entities_in_doc.append(
                            entity_data.get("entity_name", entity_id)
                        )

                for rel_id, rel_data in relationships_data.items():
                    if rel_data and rel_data.get("source_id") == doc_id:
                        relationships_in_doc.append(rel_data)

                # Calculate connectivity score
                entity_count = len(entities_in_doc)
                relationship_count = len(relationships_in_doc)
                connectivity_score = (
                    relationship_count * 2
                ) + entity_count  # Weight relationships higher

                # Get key entities (most mentioned)
                key_entities = entities_in_doc[:5]  # Top 5 entities

                document_connectivity.append(
                    DocumentConnectivityResponse(
                        document_id=doc_id,
                        entities_mentioned=entity_count,
                        relationships_formed=relationship_count,
                        connectivity_score=connectivity_score,
                        key_entities=key_entities,
                    )
                )

            # Sort by connectivity score
            document_connectivity.sort(key=lambda x: x.connectivity_score, reverse=True)

            return document_connectivity[:20]  # Return top 20 most connected documents

        except Exception as e:
            logger.error(f"Error analyzing document connectivity: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    @router.get(
        "/knowledge-gaps",
        response_model=KnowledgeGapResponse,
        dependencies=[Depends(combined_auth)],
    )
    async def identify_knowledge_gaps():
        """
        Identify potential gaps in the knowledge graph.

        Finds isolated entities, potential missing connections, and
        underrepresented topics that might need more coverage.

        Returns:
            KnowledgeGapResponse: Analysis of knowledge gaps

        Raises:
            HTTPException: If error occurs during gap analysis (500)
        """
        try:
            # Get all entities and relationships
            entities_data = await rag.entities_vdb.get_by_ids(
                list(await rag.entities_vdb.index_done_callback())
            )
            relationships_data = await rag.relationships_vdb.get_by_ids(
                list(await rag.relationships_vdb.index_done_callback())
            )

            # Count connections for each entity
            entity_connections = defaultdict(int)
            entity_neighbors = defaultdict(set)

            for rel_data in relationships_data.values():
                if rel_data:
                    src_id = rel_data.get("src_id", "")
                    tgt_id = rel_data.get("tgt_id", "")
                    if src_id and tgt_id:
                        entity_connections[src_id] += 1
                        entity_connections[tgt_id] += 1
                        entity_neighbors[src_id].add(tgt_id)
                        entity_neighbors[tgt_id].add(src_id)

            # Identify isolated entities (low connectivity)
            isolated_entities = []
            for entity_id, entity_data in entities_data.items():
                if entity_data:
                    connections = entity_connections[entity_id]
                    if connections <= 2:  # Very few connections
                        isolated_entities.append(
                            EntityInsight(
                                name=entity_data.get("entity_name", entity_id),
                                type=entity_data.get("entity_type", "unknown"),
                                degree=connections,
                                description=entity_data.get("description", ""),
                            )
                        )

            # Identify potential missing connections
            # Look for entities that should be connected based on co-occurrence
            missing_connections = []
            entity_types = defaultdict(list)

            for entity_id, entity_data in entities_data.items():
                if entity_data:
                    entity_type = entity_data.get("entity_type", "unknown")
                    entity_types[entity_type].append(entity_id)

            # Look for entities of same type that aren't connected
            for entity_type, entity_list in entity_types.items():
                if len(entity_list) > 1 and entity_type in [
                    "person",
                    "organization",
                    "location",
                ]:
                    for i, entity1 in enumerate(entity_list):
                        for entity2 in entity_list[i + 1 :]:
                            if entity2 not in entity_neighbors[entity1]:
                                name1 = entities_data[entity1].get(
                                    "entity_name", entity1
                                )
                                name2 = entities_data[entity2].get(
                                    "entity_name", entity2
                                )
                                missing_connections.append((name1, name2))
                                if len(missing_connections) >= 10:  # Limit results
                                    break
                        if len(missing_connections) >= 10:
                            break
                    if len(missing_connections) >= 10:
                        break

            # Identify underrepresented topics
            type_counts = Counter()
            for entity_data in entities_data.values():
                if entity_data:
                    entity_type = entity_data.get("entity_type", "unknown")
                    type_counts[entity_type] += 1

            # Find types with very few entities
            total_entities = sum(type_counts.values())
            underrepresented_topics = []
            for entity_type, count in type_counts.items():
                if count / total_entities < 0.05:  # Less than 5% of entities
                    underrepresented_topics.append(entity_type)

            return KnowledgeGapResponse(
                isolated_entities=isolated_entities[:10],  # Top 10 isolated
                missing_connections=missing_connections[
                    :10
                ],  # Top 10 potential connections
                underrepresented_topics=underrepresented_topics[
                    :5
                ],  # Top 5 underrepresented
            )

        except Exception as e:
            logger.error(f"Error identifying knowledge gaps: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=str(e))

    return router
