import { Field, SmartContract, state, State, method } from 'o1js';

export class Hello extends SmartContract {
  @state(Field) num = State<Field>();

  init() {
    super.init();
    this.num.set(Field(1));
  }

  @method update() {
    const currentState = this.num.getAndAssertEquals();
    const newState = currentState.add(2);
    this.num.set(newState);
  }

  @method multiply() {
    const newState = this.num.getAndAssertEquals().mul(Field(2));
    this.num.set(newState);
  }
}
