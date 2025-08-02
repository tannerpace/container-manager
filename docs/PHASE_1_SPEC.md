# Phase 1 Technical Specification

**Core Container Management Implementation**

## 🎯 Overview

Phase 1 focuses on building robust container management capabilities that form the foundation of a Docker Desktop clone. This phase will establish the core patterns and architecture for future phases.

---

## 🏗️ Architecture Improvements

### State Management Refactoring

```typescript
// Current: Basic Context API
// Future: Zustand with proper typing and persistence

interface AppStore {
  // Container state
  containers: DockerContainer[]
  selectedContainer: DockerContainer | null
  containerStats: Map<string, ContainerStats>

  // UI state
  activeView: "list" | "details" | "logs" | "terminal"
  filters: ContainerFilters
  sortConfig: SortConfig

  // Actions
  selectContainer: (id: string) => void
  refreshContainers: () => Promise<void>
  updateContainerStats: (id: string, stats: ContainerStats) => void
}
```

### Enhanced Docker API Client

```typescript
class DockerAPIClient {
  private baseURL: string
  private timeout: number = 10000

  // Container operations
  async getContainers(all?: boolean): Promise<DockerContainer[]>
  async getContainer(id: string): Promise<DockerContainerDetails>
  async startContainer(id: string): Promise<void>
  async stopContainer(id: string, timeout?: number): Promise<void>
  async restartContainer(id: string, timeout?: number): Promise<void>
  async pauseContainer(id: string): Promise<void>
  async unpauseContainer(id: string): Promise<void>
  async removeContainer(id: string, force?: boolean): Promise<void>
  async renameContainer(id: string, name: string): Promise<void>

  // Container inspection
  async getContainerLogs(id: string, options?: LogOptions): Promise<Stream>
  async getContainerStats(id: string): Promise<ContainerStats>
  async execInContainer(id: string, command: string[]): Promise<ExecResult>

  // Stream handling
  async streamLogs(id: string, callback: (chunk: string) => void): Promise<void>
  async streamStats(
    id: string,
    callback: (stats: ContainerStats) => void
  ): Promise<void>
}
```

---

## 🐳 Container Details View

### Component Structure

```
ContainerDetails/
├── ContainerDetails.tsx          # Main container component
├── ContainerDetails.css          # Styling
├── tabs/
│   ├── OverviewTab.tsx          # General information
│   ├── EnvironmentTab.tsx       # Environment variables
│   ├── NetworkTab.tsx           # Network configuration
│   ├── VolumesTab.tsx           # Volume mounts
│   ├── LogsTab.tsx              # Container logs
│   └── TerminalTab.tsx          # Terminal access
└── components/
    ├── ContainerHeader.tsx       # Container name, status, actions
    ├── StatsWidget.tsx          # CPU, Memory, Network stats
    └── ActionButtons.tsx        # Start, Stop, Remove, etc.
```

### Key Features Implementation

#### 1. Container Overview Tab

```typescript
interface ContainerOverview {
  id: string
  name: string
  image: string
  status: ContainerStatus
  created: Date
  started?: Date
  ports: PortMapping[]
  labels: Record<string, string>
  command: string
  entrypoint: string[]
  workingDir: string
  user: string
  restartPolicy: RestartPolicy
}

const OverviewTab: React.FC<{ container: ContainerOverview }> = ({
  container,
}) => {
  return (
    <div className="overview-tab">
      <InfoSection title="Basic Information">
        <InfoRow label="Container ID" value={container.id.substring(0, 12)} />
        <InfoRow label="Image" value={container.image} />
        <InfoRow label="Status" value={container.status} />
        <InfoRow label="Created" value={formatDate(container.created)} />
      </InfoSection>

      <InfoSection title="Configuration">
        <InfoRow label="Command" value={container.command} />
        <InfoRow label="Working Directory" value={container.workingDir} />
        <InfoRow label="User" value={container.user} />
      </InfoSection>

      <PortMappings ports={container.ports} />
      <Labels labels={container.labels} />
    </div>
  )
}
```

#### 2. Environment Variables Tab

```typescript
interface EnvironmentVariable {
  key: string
  value: string
  isSecret?: boolean
}

const EnvironmentTab: React.FC<{ containerID: string }> = ({ containerID }) => {
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEnvVars = envVars.filter(
    (env) =>
      env.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="environment-tab">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search environment variables..."
      />

      <EnvVarTable
        variables={filteredEnvVars}
        onCopy={(key, value) => copyToClipboard(`${key}=${value}`)}
      />
    </div>
  )
}
```

#### 3. Real-time Logs Tab

```typescript
interface LogEntry {
  timestamp: Date
  stream: "stdout" | "stderr"
  message: string
}

const LogsTab: React.FC<{ containerID: string }> = ({ containerID }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [filter, setFilter] = useState<"all" | "stdout" | "stderr">("all")

  const streamLogs = useCallback(async () => {
    const stream = await dockerAPI.streamLogs(containerID, {
      follow: true,
      timestamps: true,
    })

    stream.on("data", (chunk) => {
      const entry = parseLogEntry(chunk)
      setLogs((prev) => [...prev, entry])
    })

    setIsStreaming(true)
  }, [containerID])

  return (
    <div className="logs-tab">
      <LogsToolbar
        onStream={streamLogs}
        onClear={() => setLogs([])}
        onDownload={() => downloadLogs(logs)}
        filter={filter}
        onFilterChange={setFilter}
        isStreaming={isStreaming}
      />

      <VirtualizedLogViewer
        logs={logs.filter((log) => filter === "all" || log.stream === filter)}
        onCopy={(log) => copyToClipboard(log.message)}
      />
    </div>
  )
}
```

#### 4. Terminal Access Tab

```typescript
const TerminalTab: React.FC<{ containerID: string }> = ({ containerID }) => {
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null)

  const createTerminal = async (shell = "/bin/bash") => {
    const terminal = await dockerAPI.createExec(containerID, {
      Cmd: [shell],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    })

    setTerminals((prev) => [...prev, terminal])
    setActiveTerminal(terminal.id)
  }

  return (
    <div className="terminal-tab">
      <TerminalTabs
        terminals={terminals}
        activeTerminal={activeTerminal}
        onTabChange={setActiveTerminal}
        onNewTerminal={createTerminal}
        onCloseTerminal={(id) =>
          setTerminals((prev) => prev.filter((t) => t.id !== id))
        }
      />

      {activeTerminal && (
        <XTermTerminal
          terminalId={activeTerminal}
          onResize={(cols, rows) =>
            dockerAPI.resizeExec(activeTerminal, cols, rows)
          }
        />
      )}
    </div>
  )
}
```

---

## 📊 Enhanced Data Tables

### Virtualized Container Table

```typescript
interface ContainerTableProps {
  containers: DockerContainer[]
  selectedIds: string[]
  onSelect: (ids: string[]) => void
  onSort: (column: string, direction: "asc" | "desc") => void
  sortConfig: SortConfig
}

const ContainerTable: React.FC<ContainerTableProps> = ({
  containers,
  selectedIds,
  onSelect,
  onSort,
  sortConfig,
}) => {
  const columns: TableColumn[] = [
    { key: "name", label: "Name", sortable: true, width: 200 },
    { key: "image", label: "Image", sortable: true, width: 180 },
    { key: "status", label: "Status", sortable: true, width: 120 },
    { key: "ports", label: "Ports", sortable: false, width: 150 },
    { key: "created", label: "Created", sortable: true, width: 120 },
    { key: "actions", label: "Actions", sortable: false, width: 120 },
  ]

  return (
    <div className="container-table">
      <TableHeader
        columns={columns}
        sortConfig={sortConfig}
        onSort={onSort}
        selectedCount={selectedIds.length}
        totalCount={containers.length}
        onSelectAll={() => onSelect(containers.map((c) => c.Id))}
      />

      <VirtualizedTable
        items={containers}
        columns={columns}
        selectedIds={selectedIds}
        onSelect={onSelect}
        itemHeight={60}
        renderRow={(container, isSelected) => (
          <ContainerRow
            container={container}
            isSelected={isSelected}
            onToggleSelect={() => toggleSelection(container.Id)}
          />
        )}
      />
    </div>
  )
}
```

### Bulk Operations

```typescript
interface BulkOperationsProps {
  selectedIds: string[]
  onClearSelection: () => void
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedIds,
  onClearSelection,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleBulkOperation = async (
    operation: "start" | "stop" | "remove"
  ) => {
    setIsLoading(true)

    try {
      await Promise.all(
        selectedIds.map((id) => {
          switch (operation) {
            case "start":
              return dockerAPI.startContainer(id)
            case "stop":
              return dockerAPI.stopContainer(id)
            case "remove":
              return dockerAPI.removeContainer(id)
          }
        })
      )

      onClearSelection()
      toast.success(
        `${operation} completed for ${selectedIds.length} containers`
      )
    } catch (error) {
      toast.error(`Failed to ${operation} containers: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bulk-operations">
      <span>{selectedIds.length} containers selected</span>

      <Button onClick={() => handleBulkOperation("start")} disabled={isLoading}>
        Start All
      </Button>
      <Button onClick={() => handleBulkOperation("stop")} disabled={isLoading}>
        Stop All
      </Button>
      <Button
        onClick={() => handleBulkOperation("remove")}
        disabled={isLoading}
        variant="danger"
      >
        Remove All
      </Button>

      <Button onClick={onClearSelection} variant="ghost">
        Clear Selection
      </Button>
    </div>
  )
}
```

---

## 🔍 Advanced Search & Filtering

### Search Implementation

```typescript
interface SearchFilters {
  text: string
  status: ContainerStatus[]
  images: string[]
  labels: Record<string, string>
  ports: PortFilter[]
  dateRange: { start: Date; end: Date } | null
}

const useContainerSearch = (containers: DockerContainer[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    text: "",
    status: [],
    images: [],
    labels: {},
    ports: [],
    dateRange: null,
  })

  const filteredContainers = useMemo(() => {
    return containers.filter((container) => {
      // Text search
      if (filters.text) {
        const searchText = filters.text.toLowerCase()
        const searchable = [
          container.Names.join(" "),
          container.Image,
          container.Id,
          container.Command,
        ]
          .join(" ")
          .toLowerCase()

        if (!searchable.includes(searchText)) return false
      }

      // Status filter
      if (filters.status.length > 0) {
        if (!filters.status.includes(container.State as ContainerStatus))
          return false
      }

      // Image filter
      if (filters.images.length > 0) {
        if (!filters.images.some((img) => container.Image.includes(img)))
          return false
      }

      // Label filter
      for (const [key, value] of Object.entries(filters.labels)) {
        if (container.Labels[key] !== value) return false
      }

      // Date range filter
      if (filters.dateRange) {
        const created = new Date(container.Created * 1000)
        if (
          created < filters.dateRange.start ||
          created > filters.dateRange.end
        ) {
          return false
        }
      }

      return true
    })
  }, [containers, filters])

  return { filteredContainers, filters, setFilters }
}
```

### Advanced Filter UI

```typescript
const AdvancedFilters: React.FC<{
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableImages: string[]
}> = ({ filters, onFiltersChange, availableImages }) => {
  return (
    <div className="advanced-filters">
      <FilterSection title="Status">
        <CheckboxGroup
          options={["running", "exited", "paused", "restarting"]}
          selected={filters.status}
          onChange={(status) => onFiltersChange({ ...filters, status })}
        />
      </FilterSection>

      <FilterSection title="Images">
        <MultiSelect
          options={availableImages}
          selected={filters.images}
          onChange={(images) => onFiltersChange({ ...filters, images })}
          placeholder="Select images..."
        />
      </FilterSection>

      <FilterSection title="Labels">
        <LabelFilter
          labels={filters.labels}
          onChange={(labels) => onFiltersChange({ ...filters, labels })}
        />
      </FilterSection>

      <FilterSection title="Created Date">
        <DateRangePicker
          value={filters.dateRange}
          onChange={(dateRange) => onFiltersChange({ ...filters, dateRange })}
        />
      </FilterSection>
    </div>
  )
}
```

---

## 🚧 Implementation Tasks

### Week 1: Foundation

- [ ] Refactor DockerContext to use Zustand
- [ ] Implement enhanced Docker API client
- [ ] Create base components for details view
- [ ] Set up virtualized table component

### Week 2: Container Details

- [ ] Implement Overview tab with all container information
- [ ] Build Environment variables tab with search
- [ ] Create Network and Volumes tabs
- [ ] Add real-time stats widgets

### Week 3: Logs & Terminal

- [ ] Implement real-time log streaming
- [ ] Build log filtering and search
- [ ] Create terminal component with xterm.js
- [ ] Add multi-tab terminal support

### Week 4: Enhanced UI

- [ ] Build advanced search and filtering
- [ ] Implement bulk operations
- [ ] Add sortable, selectable data tables
- [ ] Polish UI/UX and add animations

### Week 5: Testing & Polish

- [ ] Write comprehensive tests
- [ ] Performance optimization
- [ ] Bug fixes and edge cases
- [ ] Documentation updates

---

## 📈 Success Criteria

### Functional Requirements

- [ ] View detailed container information
- [ ] Real-time log streaming with filtering
- [ ] Terminal access to running containers
- [ ] Advanced search across all container properties
- [ ] Bulk operations on multiple containers
- [ ] Sortable and filterable container tables

### Performance Requirements

- [ ] Handle 1000+ containers without performance issues
- [ ] Log streaming with <100ms latency
- [ ] Search results in <200ms
- [ ] Smooth scrolling in virtualized lists

### User Experience

- [ ] Intuitive navigation between views
- [ ] Responsive design for different screen sizes
- [ ] Keyboard shortcuts for common actions
- [ ] Loading states and error handling

This specification provides a solid foundation for Phase 1 development and establishes patterns that will be used throughout the remaining phases.
