"use strict";

import { render, Component } from "preact";

type GameBoardState = {
  time: number;
  seeds: number;
  grain: number;
  money: number;
  land: number[];
};

class GameBoard extends Component<{}, GameBoardState> {
  rafHandle: number;

  constructor() {
    super();
    this.state = {
      time: Date.now(),
      seeds: 0,
      grain: 0,
      money: 0,
      land: [0]
    }
  }

  componentDidMount(): void {
    this.tick();
  }

  componentWillUnmount(): void {
    cancelAnimationFrame(this.rafHandle);
  }

  tick = () => {
    this.rafHandle = requestAnimationFrame(this.tick);
    this.setState({time: Date.now()});
  }

  onSeedsClick = () => {
    this.setState({seeds: this.state.seeds + 1});
  }

  onGrainSellClick = () => {
    let sold = Math.min(this.state.grain, 1);
    this.setState({grain: this.state.grain - sold, money: this.state.money + sold });
  }

  onLandPlantClick = () => {
    if (this.state.seeds > 0) {
      let availableLand = this.state.land.findIndex((v) => v == 0);
      if (availableLand >= 0) {
        let newLands = this.state.land.slice();
        newLands[availableLand] = this.state.time + 1000;
        this.setState({seeds: this.state.seeds - 1, land: newLands });
      }
    }
  }

  onLandHarvestClick = () => {
    let harvestableLand = this.state.land.findIndex((v) => v != 0 && v <= this.state.time);
    if (harvestableLand  >= 0) {
      let newLands = this.state.land.slice();
      newLands[harvestableLand] = 0;
      this.setState({grain: this.state.grain + 1, land: newLands });
    }
  }

  render() {
    let availableLand = this.state.land.findIndex((v) => v == 0) >= 0;
    let harvestableLand = this.state.land.findIndex((v) => v != 0 && v <= this.state.time) >= 0;
    return <div>
      {/* <p>Time: {this.state.time}</p> */}
      <p>Seeds: {this.state.seeds} <>&nbsp;<button onClick={this.onSeedsClick}>Pick up</button></></p>
      <p>Land: {this.state.land.length}
        {/* [{this.state.land.join(", ")}] */}
        {this.state.seeds > 0 && availableLand && <>&nbsp;<button onClick={this.onLandPlantClick}>Plant</button></>}
        {harvestableLand && <>&nbsp;<button onClick={this.onLandHarvestClick}>Harvest</button></>}
      </p>
      <p>Grain: {this.state.grain} {} {(this.state.grain > 0) && <button onClick={this.onGrainSellClick}>Sell</button>}</p>
      <p>Money: {this.state.money}</p>
    </div>;
  }

}

render(<GameBoard />, document.getElementById("app"));