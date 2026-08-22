import type { AntennaColor } from "./protocol";

export class SimulatedFurby {
  antenna: AntennaColor = { r: 40, g: 180, b: 120 };
  lastMove = "idle";
  movingUntil = 0;

  setAntenna(c: AntennaColor) {
    this.antenna = { ...c };
  }

  play(label: string) {
    this.lastMove = label;
    this.movingUntil = Date.now() + 1800;
  }

  isMoving() {
    return Date.now() < this.movingUntil;
  }
}
