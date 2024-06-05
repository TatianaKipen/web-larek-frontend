import { Component } from './base/Component';
import { IProductItem } from '../types';
import { ensureElement } from '../utils/utils';

const categories: { [key: string]: string } = {
	'софт-скил': 'card__category_soft',
	'хард-скил': 'card__category_hard',
	'кнопка': 'card__category_button',
	'дополнительное': 'card__category_additional',
	'другое': 'card__category_other',
};

export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProductItem> {
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _price: HTMLElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _count?: HTMLElement;

	constructor(
		protected blockname: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);
		
		this._category = container.querySelector(`.${blockname}__category`);
		this._title = ensureElement<HTMLElement>(`.${blockname}__title`, container);
		this._image = container.querySelector(`.${blockname}__image`);
		this._price = ensureElement<HTMLElement>(`.${blockname}__price`, container);
		this._description = container.querySelector(`.${blockname}__text`);
		this._button = container.querySelector(`.${blockname}__button`);
		this._count = container.querySelector(`.${blockname}__item-index`);
		
		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	// id контейнера
	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	// название товара
	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	// изображение карточки
	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	// описание карточки
	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descriptionTemp = this._description.cloneNode() as HTMLElement;
					this.setText(descriptionTemp, str);
					return descriptionTemp;
				}));
		} else {
			this.setText(this._description, value);
		}
	}

	// текст для кнопки на предпросмотре
	set button(value: string) {
		this.setText(this._button, value);
	}

	// цена товара
	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
		} else {
			this.setText(this._price, `${value.toString()} синапсов`);
		}
	}

	get price(): number {
		return Number(this._price.textContent) || null;
	}

	// номер товара в корзине
	set index(value: string) {
		this._count.textContent = value;
	}
	
	get index(): string {
		return this._count.textContent || '';
	}

	// категория товара
	set category(value: string) {
		this.setText(this._category, value);
		if (this._category) {
			this._category.classList.add(categories[value]);
		}
	}
	
	get category() {
		return this._category.textContent || '';
	}
}