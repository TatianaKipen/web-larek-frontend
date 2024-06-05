//состояние приложения
export interface IAppState {
	catalog: IProductItem[];
	basket: IProductItem[];
	preview: string | null;
	order: IOrder | null;
	delivery: IOrderForm | null;
	contacts: IContactsForm | null;
}

// карточка товара
export interface IProductItem {
	id: string;
    description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	count?: number;
	button?: string;
}

// форма оплаты
export interface IOrderForm {
	payment: string;
	address: string;
}

//форма ввода контактных данных
export interface IContactsForm {
	email: string;
	phone: string;
}

//форма заказа
export interface IOrder extends IOrderForm, IContactsForm {
	items: string[];
	total: number;
}

//успешный заказ
export interface ISuccess {
	id: string;
	total: number;
}

//ошибки формы
export type FormErrors = Partial<Record<keyof IOrder, string>>;