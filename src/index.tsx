"use strict";

import { render, Component } from "preact";

type GameBoardState = {
  time: number;
  seeds: number;
  grain: number;
  money: number;
  land: number[];
  pickers: number[];
  harvesters: number[];
  sellers: number[];

  maxMoney: number;
  autoplant: boolean;
};

class GameBoard extends Component<{}, GameBoardState> {
  rafHandle: number;

  constructor() {
    super();
    this.state = {
      time: Date.now(),
      seeds: 0,
      grain: 0,
      money: 9,
      land: [0],
      pickers: [],
      harvesters: [],
      sellers: [],


      maxMoney: 0,

      autoplant: false,
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
    this.setState({time: Date.now(), maxMoney: Math.max(this.state.maxMoney, this.state.money)});
  }

  onSeedsClick = () => {
    this.setState({seeds: this.state.seeds + 1});
  }

  onGrainSellClick = () => {
    let sold = Math.min(this.state.grain, 1);
    this.setState({grain: this.state.grain - sold, money: this.state.money + sold });
  }

  onLandPlantClick = () => {
    if (this.state.autoplant) this.onLandHarvest();
    this.onLandPlant();
  }

  onLandHarvestClick = () => {
    this.onLandHarvest();
    if (this.state.autoplant) this.onLandPlant();
  }

  onLandPlant = () => {
    if (this.state.seeds > 0 && this.onUseItemAvailable("land", 1000)) {
      this.setState({seeds: this.state.seeds - 1 });
    }
  }

  onLandHarvest = () => {
    if (this.onUseItemReady("land")) {
      this.setState({grain: this.state.grain + 1});
    }
  }

  onBuyLandClick = () => this.onItemBuy("land", 10);
  onBuyPickerClick = () => this.onItemBuy("pickers", 30);
  onBuyHarvesterClick = () => this.onItemBuy("harvesters", 30);
  onBuySellerClick = () => this.onItemBuy("sellers", 30);

  onItemBuy = (which: string, cost: number) => {
    if (this.state.money >= cost) {
      let updatedItems = this.state[which].slice();
      updatedItems.push(0);
      this.setState({money: this.state.money - cost, [which]: updatedItems });
    }
  }

  onBuyAutoplantClick = () => {
    if (this.state.money >= 30) {
      this.setState({money: this.state.money - 30, autoplant: true });
    }
  }

  findAvailable = (which: string) => {
    return this.state[which].findIndex((v: number) => v == 0);
  }
  findReady = (which: string) => {
    return this.state[which].findIndex((v: number) => v != 0 && v <= this.state.time);
  }
  onUseItemReady = (which: string) => {
    let readyItem = this.findReady(which);
    if (readyItem == -1) {
      return false;
    }
    let updatedItems = this.state[which].slice();
    updatedItems[readyItem] = 0;
    this.setState({[which]: updatedItems });
    return true;
  }
  onUseItemAvailable = (which: string, duration: number) => {
    let readyItem = this.findAvailable(which);
    if (readyItem == -1) {
      return false;
    }
    let updatedItems = this.state[which].slice();
    updatedItems[readyItem] = this.state.time + duration;
    this.setState({[which]: updatedItems });
    return true;
  }

  render() {
    let canPlant = this.state.seeds > 0 && this.findAvailable("land") >= 0;
    let canHarvest = this.findReady("land") >= 0;
    // let autoplant = this.state.autoplant && (canPlant || canHarvest);
    return <div>
      {/* <p>Time: {this.state.time}</p> */}
      <div>Seeds: {this.state.seeds} <>&nbsp;<button onClick={this.onSeedsClick}>Pick up</button></></div>
      <div>Land: {this.state.land.length}
        {/* [{this.state.land.join(", ")}] */}
        <>&nbsp;<button onClick={this.onBuyLandClick} disabled={this.state.money < 10}>Buy (10)</button></>
        {canPlant && <>&nbsp;<button onClick={this.onLandPlantClick}>Plant</button></>}
        {canHarvest && <>&nbsp;<button onClick={this.onLandHarvestClick}>Harvest</button></>}
      </div>
      <div>Grain: {this.state.grain} {(this.state.grain > 0) && <>&nbsp;<button onClick={this.onGrainSellClick}>Sell</button></>}</div>
      <div>Money: {this.state.money}</div>
      <div>
        {!this.state.autoplant && this.state.maxMoney >= 15 && <>&nbsp;<button onClick={this.onBuyAutoplantClick} disabled={this.state.money < 30} title="Automatically harvest & plant in one go">Buy Autoplant (30)</button></>}
      </div><div>
        {this.state.maxMoney >= 15 && <>&nbsp;<button onClick={this.onBuyPickerClick} disabled={this.state.money < 30} title={`Buy Automatic Picker (have ${this.state.pickers.length})`}>Buy Picker (30)</button></>}
        {this.state.autoplant && this.state.maxMoney >= 15 && <>&nbsp;<button onClick={this.onBuyHarvesterClick} disabled={this.state.money < 30} title={`Buy Automatic Harvester/Planter (have ${this.state.harvesters.length})`}>Buy Harvester (30)</button></>}
        {this.state.maxMoney >= 15 && <>&nbsp;<button onClick={this.onBuySellerClick} disabled={this.state.money < 30} title={`Buy Automatic Seller (have ${this.state.sellers.length})`}>Buy Seller (30)</button></>}
      </div>
    </div>;
  }

}

render(<GameBoard />, document.getElementById("app"));