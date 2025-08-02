import type { DockerContainer, DockerImage, DockerNetwork, DockerVolume } from '../types/dockerTypes'

// Search/filter utility functions
export const filterContainers = (
  containers: DockerContainer[],
  searchTerm: string
): DockerContainer[] => {
  if (!searchTerm.trim()) return containers
  const term = searchTerm.toLowerCase()
  return containers.filter(
    (container) =>
      container.Names.some((name) => name.toLowerCase().includes(term)) ||
      container.Image.toLowerCase().includes(term) ||
      container.Id.toLowerCase().includes(term) ||
      container.State.toLowerCase().includes(term) ||
      container.Status.toLowerCase().includes(term)
  )
}

export const filterImages = (
  images: DockerImage[],
  searchTerm: string
): DockerImage[] => {
  if (!searchTerm.trim()) return images
  const term = searchTerm.toLowerCase()
  return images.filter(
    (image) =>
      image.Id.toLowerCase().includes(term) ||
      (image.RepoTags &&
        image.RepoTags.some((tag) => tag.toLowerCase().includes(term))) ||
      (image.RepoDigests &&
        image.RepoDigests.some((digest) =>
          digest.toLowerCase().includes(term)
        ))
  )
}

export const filterVolumes = (
  volumes: DockerVolume[],
  searchTerm: string
): DockerVolume[] => {
  if (!searchTerm.trim()) return volumes
  const term = searchTerm.toLowerCase()
  return volumes.filter(
    (volume) =>
      volume.Name.toLowerCase().includes(term) ||
      volume.Driver.toLowerCase().includes(term) ||
      volume.Mountpoint.toLowerCase().includes(term)
  )
}

export const filterNetworks = (
  networks: DockerNetwork[],
  searchTerm: string
): DockerNetwork[] => {
  if (!searchTerm.trim()) return networks
  const term = searchTerm.toLowerCase()
  return networks.filter(
    (network) =>
      network.Name.toLowerCase().includes(term) ||
      network.Id.toLowerCase().includes(term) ||
      network.Driver.toLowerCase().includes(term) ||
      network.Scope.toLowerCase().includes(term)
  )
}
