import { IOrderForm } from '../types';
import { ICardActions } from './Card';
import { IEvents } from './base/events';
import { Form } from './common/Form';
import { ensureElement } from '../utils/utils';

export class orderForm extends Form<IOrderForm> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;

	constructor( container: HTMLFormElement, events: IEvents, actions: ICardActions) {
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

	togglePaymentButton(changePayment: HTMLButtonElement): void {
		this._card.classList.remove('button_alt-active');
		this._cash.classList.remove('button_alt-active');
		changePayment.classList.add('button_alt-active');
	}

	clearPayment() {
		this._card.classList.remove('button_alt-active');
		this._cash.classList.remove('button_alt-active');
	}
}