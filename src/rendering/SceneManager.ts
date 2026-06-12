/**
 * Three.js scene, renderer, camera, factory meshes, and robot mesh lifecycle.
 */

import type { RobotDigitalTwin, ScenarioDefinition, WorkerEntity } from '@types';
import * as THREE from 'three';
import { FloorMaterial } from './materials/FloorMaterial';
import { AmbientParticles } from './effects/AmbientParticles';
import { CameraController } from './CameraController';
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
  private readonly pathVisualization = new PathVisualization();
  private scenario: ScenarioDefinition | null = null;

  public constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor('#0A0E1A');
    this.container.appendChild(this.renderer.domElement);
    this.scene.add(this.pathVisualization.group);
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
    this.pathVisualization.setPath(twin.path);
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
    }

    for (const dock of scenario.docks) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.055, 1.1), dockMaterial);
      pad.position.set(dock.position.x, 0.03, dock.position.y);
      pad.receiveShadow = true;
      this.scene.add(pad);
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
}
