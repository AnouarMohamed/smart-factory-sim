/**
 * Procedural shelf mesh with inventory fill visualization.
 */

import type { ShelfEntity } from '@types';
import * as THREE from 'three';
import { MetalMaterial } from '../materials/MetalMaterial';

export class ShelfMesh {
  public readonly group = new THREE.Group();

  public constructor(shelf: ShelfEntity) {
    const material = new MetalMaterial().shelf();
    const rack = new THREE.Mesh(new THREE.BoxGeometry(shelf.size.x, 0.36, shelf.size.y), material);
    rack.position.set(shelf.position.x + shelf.size.x / 2, 0.18, shelf.position.y + shelf.size.y / 2);
    const fill = new THREE.Mesh(
      new THREE.BoxGeometry(shelf.size.x * 0.8, 0.08, shelf.size.y * (shelf.stockLevel / shelf.capacity)),
      new THREE.MeshStandardMaterial({ color: '#00D4FF', emissive: '#003443', roughness: 0.5 })
    );
    fill.position.set(rack.position.x, 0.43, rack.position.z);
    this.group.add(rack, fill);
  }
}

