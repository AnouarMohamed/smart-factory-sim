/**
 * Three.js scene, renderer, camera, factory meshes, and robot mesh lifecycle.
 */

import type { RobotDigitalTwin, ScenarioDefinition, WorkerEntity } from '@types';
import * as THREE from 'three';
import { FloorMaterial } from './materials/FloorMaterial';
import { AmbientParticles } from './effects/AmbientParticles';
import { CameraController, type CameraMode } from './CameraController';
import { DayNightCycle } from './DayNightCycle';
import { LightingSystem } from './LightingSystem';
import { ConveyorMesh } from './objects/ConveyorMesh';
import { HeatmapVisualization } from './objects/HeatmapVisualization';
import { PathVisualization } from './objects/PathVisualization';
import { RobotMesh } from './objects/RobotMesh';
import { ShelfMesh } from './objects/ShelfMesh';
import { WorkerMesh } from './objects/WorkerMesh';

export class SceneManager {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly lighting = new LightingSystem();
  private readonly dayNight = new DayNightCycle();
  private readonly cameraController = new CameraController(this.camera);
  private readonly robots = new Map<string, RobotMesh>();
  private readonly workers = new Map<string, WorkerMesh>();
  private readonly pathVisualizations = new Map<string, PathVisualization>();
  private scenario: ScenarioDefinition | null = null;

  public constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor('#0A0E1A');
    this.container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', (): void => this.resize());
    this.resize();
  }

  /** Build the factory scene from a scenario. */
  public loadScenario(scenario: ScenarioDefinition): void {
    this.scenario = scenario;
    const floorMaterial = new FloorMaterial();
    const width = scenario.grid.width;
    const height = scenario.grid.height;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, height), floorMaterial.create());
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(width / 2, 0, height / 2);
    floor.receiveShadow = true;
    this.scene.add(floor, new HeatmapVisualization(width, height).mesh, new AmbientParticles(width, height).points);
    this.addGridLines(width, height, floorMaterial.grid());
    this.addFactoryShell(width, height);
    this.addFactoryStations();

    for (const shelf of scenario.shelves) {
      this.scene.add(new ShelfMesh(shelf).group);
    }

    for (const conveyor of scenario.conveyors) {
      this.scene.add(new ConveyorMesh(conveyor).group);
    }

    for (const worker of scenario.workers) {
      const mesh = new WorkerMesh(worker);
      this.workers.set(worker.id, mesh);
      this.scene.add(mesh.group);
    }

    this.addOperationalMarkers(scenario);
    this.lighting.mount(this.scene, width, height);
    this.dayNight.apply(this.scene, this.lighting.sun, scenario.startHour);
    this.cameraController.update(null);
  }

  /** Update or create a robot mesh from a digital twin. */
  public updateRobot(twin: RobotDigitalTwin, deltaSeconds: number): void {
    const mesh = this.robots.get(twin.id) ?? new RobotMesh(twin.id);
    if (!this.robots.has(twin.id)) {
      this.robots.set(twin.id, mesh);
      this.scene.add(mesh.group);
    }
    mesh.update(twin, deltaSeconds);
    const pathVisualization = this.pathVisualizations.get(twin.id) ?? this.createPathVisualization(twin.id);
    pathVisualization.setPath(twin.path);
  }

  /** Update worker meshes. */
  public updateWorkers(workers: readonly WorkerEntity[]): void {
    for (const worker of workers) {
      const mesh = this.workers.get(worker.id);
      if (mesh) {
        mesh.update(worker);
      }
    }
  }

  /** Render the current scene. */
  public render(followed: RobotDigitalTwin | null): void {
    this.cameraController.update(followed);
    this.renderer.render(this.scene, this.camera);
  }

  /** Set active camera mode. */
  public setCameraMode(mode: CameraMode): void {
    this.cameraController.setMode(mode);
  }

  /** Resize renderer to the container dimensions. */
  public resize(): void {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private addGridLines(width: number, height: number, material: THREE.LineBasicMaterial): void {
    const points: THREE.Vector3[] = [];
    for (let x = 0; x <= width; x += 1) {
      points.push(new THREE.Vector3(x, 0.01, 0), new THREE.Vector3(x, 0.01, height));
    }
    for (let y = 0; y <= height; y += 1) {
      points.push(new THREE.Vector3(0, 0.01, y), new THREE.Vector3(width, 0.01, y));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.scene.add(new THREE.LineSegments(geometry, material));
  }

  private addOperationalMarkers(scenario: ScenarioDefinition): void {
    const chargerMaterial = new THREE.MeshStandardMaterial({
      color: '#00FF88',
      emissive: '#00351f',
      roughness: 0.5
    });
    const dockMaterial = new THREE.MeshStandardMaterial({
      color: '#00D4FF',
      emissive: '#003544',
      roughness: 0.52
    });
    const obstacleMaterial = new THREE.MeshStandardMaterial({
      color: '#FF3B30',
      emissive: '#3b0905',
      roughness: 0.58
    });

    for (const charger of scenario.chargers) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.045, 0.9), chargerMaterial);
      pad.position.set(charger.position.x, 0.025, charger.position.y);
      pad.receiveShadow = true;
      this.scene.add(pad);
      this.scene.add(this.createLabelSprite('CHARGE', '#00FF88', charger.position.x, 0.65, charger.position.y));
    }

    for (const dock of scenario.docks) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.055, 1.1), dockMaterial);
      pad.position.set(dock.position.x, 0.03, dock.position.y);
      pad.receiveShadow = true;
      this.scene.add(pad);
      this.scene.add(this.createLabelSprite('DISPATCH', '#00D4FF', dock.position.x, 0.72, dock.position.y));
    }

    for (const hazard of scenario.hazards) {
      for (const cell of hazard.zone.cells) {
        const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.42, 0.86), obstacleMaterial);
        barrier.position.set(cell.x, 0.21, cell.y);
        barrier.castShadow = true;
        barrier.receiveShadow = true;
        this.scene.add(barrier);
      }
    }
  }

  private addFactoryShell(width: number, height: number): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#273241',
      roughness: 0.55,
      metalness: 0.18
    });
    const railMaterial = new THREE.MeshStandardMaterial({
      color: '#8B9BB4',
      roughness: 0.38,
      metalness: 0.7
    });
    const walls = [
      { position: [width / 2, 0.62, -0.25], size: [width + 1, 1.24, 0.22] },
      { position: [width / 2, 0.62, height + 0.25], size: [width + 1, 1.24, 0.22] },
      { position: [-0.25, 0.62, height / 2], size: [0.22, 1.24, height + 1] },
      { position: [width + 0.25, 0.62, height / 2], size: [0.22, 1.24, height + 1] }
    ] as const;

    for (const wall of walls) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]), wallMaterial);
      mesh.position.set(wall.position[0], wall.position[1], wall.position[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }

    for (let x = 3; x < width; x += 5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, height), railMaterial);
      beam.position.set(x, 2.8, height / 2);
      this.scene.add(beam);
    }
  }

  private addFactoryStations(): void {
    const stations = [
      { label: 'A', name: 'Receiving', x: 4, z: 6, color: '#00D4FF' },
      { label: 'B', name: 'Assembly', x: 9, z: 6, color: '#FFB300' },
      { label: 'C', name: 'Storage', x: 13, z: 6, color: '#8B9BB4' },
      { label: 'D', name: 'Dispatch', x: 18, z: 8, color: '#00FF88' }
    ] as const;

    for (const station of stations) {
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.05, 1.45),
        new THREE.MeshStandardMaterial({
          color: station.color,
          emissive: station.color,
          emissiveIntensity: 0.08,
          transparent: true,
          opacity: 0.78,
          roughness: 0.48
        })
      );
      pad.position.set(station.x, 0.035, station.z);
      this.scene.add(pad);
      this.scene.add(this.createFloorLabel(`${station.label} ${station.name}`, station.color, station.x, station.z - 1));
      this.addCrateStack(station.x + 0.9, station.z + 0.65, station.color);
    }
  }

  private addCrateStack(x: number, z: number, color: string): void {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.05 });
    for (let index = 0; index < 3; index += 1) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), material);
      crate.position.set(x + (index % 2) * 0.44, 0.14 + Math.floor(index / 2) * 0.29, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      this.scene.add(crate);
    }
  }

  private createLabelSprite(text: string, color: string, x: number, y: number, z: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(10, 14, 26, 0.86)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = color;
      context.lineWidth = 6;
      context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
      context.fillStyle = '#E6EDF7';
      context.font = '700 42px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.position.set(x, y, z);
    sprite.scale.set(1.8, 0.45, 1);
    return sprite;
  }

  private createFloorLabel(text: string, color: string, x: number, z: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(10, 14, 26, 0.74)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = color;
      context.lineWidth = 8;
      context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
      context.fillStyle = '#E6EDF7';
      context.font = '700 40px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.65, 0.42),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(x, 0.075, z);
    return label;
  }

  private createPathVisualization(robotId: string): PathVisualization {
    const color = robotId.endsWith('2') ? '#00FF88' : '#00D4FF';
    const visualization = new PathVisualization(color);
    this.pathVisualizations.set(robotId, visualization);
    this.scene.add(visualization.group);
    return visualization;
  }
}
