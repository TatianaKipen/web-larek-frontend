import { IOrderForm } from '../types';
import { ICardActions } from './Card';
import { IEvents } from './base/Events';
import { Form } from './common/Form';
import { ensureElement } from '../utils/utils';

export class OrderForm extends Form<IOrderForm> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents, actions: ICardActions) {
		super(container, events);
		this._card = ensureElement<HTMLButtonElement>(`button[name=card]`, this.container);
		this._cash = ensureElement<HTMLButtonElement>(`button[name=cash]`, this.container);

		if (actions.onClick) {
			this._card.addEventListener('click', actions.onClick);
			this._cash.addEventListener('click', actions.onClick);
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value = value;
	}

	toggleCard(state: boolean = true) {
		this.toggleClass(this._card, 'button_alt-active', state);
	}

	toggleCash(state: boolean = true) {
		this.toggleClass(this._cash, 'button_alt-active', state);
	}

	togglePaymentButton(target: HTMLElement): void {
		if(target === this._card) {
			this.toggleCard();		   
			this.toggleCash(false);		   
		} else if(target === this._cash) {		   
			this.toggleCard(false);		   
			this.toggleCash();
		}
	}

	clearPayment() {
		this.toggleCard(false);
		this.toggleCash(false);
	}
}