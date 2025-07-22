"use client";
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  FileText,
  Bell,
  Search,
  HelpCircle,
  Building2,
  Workflow
} from 'lucide-react';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  className?: string;
  selectedEntity: any;
  selectedProcess: any;
  onEntityChange: (entity: any) => void;
  onProcessChange: (process: any) => void;
  entities: any[];
}

export function Sidebar({ 
  className = "", 
  selectedEntity, 
  selectedProcess, 
  onEntityChange, 
  onProcessChange, 
  entities 
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleEntityChange = (entityId: string) => {
    const entity = entities.find(ent => ent.id === entityId);
    if (entity) {
      onEntityChange(entity);
      onProcessChange(entity.processes[0]);
    }
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleProcessChange = (process: any) => {
    onProcessChange(process);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Filter processes based on search query
  const filteredProcesses = selectedEntity?.processes?.filter((process: any) =>
    process.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          h-full bg-black border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col
          ${isCollapsed ? "w-28" : "w-78"}
          ${className}
        `}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-black/60">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shadow-sm border border-gray-700">
                <span className="text-white font-bold text-base">O</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-base">Ornua</span>
                <span className="text-xs text-gray-400">Process Library</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center mx-auto shadow-sm border border-gray-700">
              <span className="text-white font-bold text-base">O</span>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-md hover:bg-gray-900 transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Entity Selection */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-800">
            <label className="block text-xs mb-2 text-gray-300 font-medium">Entity</label>
            <select
              className="w-full rounded-md bg-black border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
              value={selectedEntity?.id}
              onChange={e => handleEntityChange(e.target.value)}
              style={{ color: 'white' }}
            >
              {entities.map(entity => (
                <option key={entity.id} value={entity.id} className="bg-black text-white">{entity.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search processes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black border border-gray-700 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Navigation - Processes */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="text-xs text-gray-300 mb-2 font-medium">Processes</div>
          <ul className="space-y-0.5">
            {filteredProcesses.map((process: any) => {
              const isActive = selectedProcess?.id === process.id;
              const Icon = process.id === 'business-model' ? Home : 
                          process.id === 'intercompany-transactions' ? Building2 :
                          process.id === 'trade-promotion' ? BarChart3 :
                          process.id === 'commodity-procurement' ? FileText :
                          process.id === 'cooperative-value' ? User :
                          process.id === 'supply-chain' ? Workflow : Workflow;

              return (
                <li key={process.id}>
                  <button
                    onClick={() => handleProcessChange(process)}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group
                      ${isActive
                        ? "bg-black/20 text-white border border-gray-500/30 shadow-lg"
                        : "text-gray-300 hover:bg-black/20 hover:text-white"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    title={isCollapsed ? process.name : undefined}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-4.5 w-4.5 flex-shrink-0
                          ${isActive 
                            ? "text-white" 
                            : "text-gray-400 group-hover:text-gray-200"
                          }
                        `}
                      />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>{process.name}</span>
                        {process.steps && process.steps.length > 0 && (
                          <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded-full
                            ${isActive
                              ? "bg-black/30 text-white border border-gray-600"
                              : "bg-black/20 text-gray-300"
                            }
                          `}>
                            {process.steps.length}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge for collapsed state */}
                    {isCollapsed && process.steps && process.steps.length > 0 && (
                      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-black/30 border border-gray-700">
                        <span className="text-[10px] font-medium text-white">
                          {process.steps.length > 9 ? '9+' : process.steps.length}
                        </span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-gray-700">
                        {process.name}
                        {process.steps && process.steps.length > 0 && (
                          <span className="ml-1.5 px-1 py-0.5 bg-black/30 rounded-full text-[10px]">
                            {process.steps.length}
                          </span>
                        )}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-black rotate-45 border-l border-b border-gray-700" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile */}
        <div className="mt-auto border-t border-gray-800">
          {/* Profile Section */}
          <div className={`border-b border-gray-800 bg-black/30 ${isCollapsed ? 'py-3 px-2' : 'p-3'}`}>
            {!isCollapsed ? (
              <div className="flex items-center px-3 py-2 rounded-md bg-black hover:bg-black/50 transition-colors duration-200">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-200 font-medium text-sm">SS</span>
                </div>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-white truncate">Sam Salt</p>
                  <p className="text-xs text-gray-400 truncate">Audit Manager</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-200 font-medium text-sm">SS</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 