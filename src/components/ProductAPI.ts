import { Api, ApiListResponse } from './base/Appppppi';
import { IOrder, ISuccess, IProductItem } from '../types';

export interface IProductAPI {
	getProductList(): Promise<IProductItem[]>;
	getProductItem(id: string): Promise<IProductItem>;
	postOrderProduct(order: IOrder): Promise<ISuccess>;
}

export class ProductAPI extends Api implements IProductAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<IProductItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProductItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getProductItem(id: string): Promise<IProductItem> {
		return this.get(`/product/${id}`).then((item: IProductItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	postOrderProduct(order: IOrder): Promise<ISuccess> {                  
		return this.post('/order', order).then((data: ISuccess) => data);
	}
}