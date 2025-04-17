import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class EslService {
  baseUrl: string | undefined = '';
  apiKey: string | undefined = '';
  constructor(
    private readonly http: HttpService,
    private configService: ConfigService,
  ) {}

  async getAllESLs() {
    this.baseUrl = this.configService.get<string>('ESL_SERVER_URL');
    this.apiKey = this.configService.get<string>('API_KEY');
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL`, { headers: { 'x-api-key': this.apiKey } })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESLs:', error);
      throw error;
    }
  }
  
  async getESLById(id: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL/${id}`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESL:', error);
      throw error;
    }
  }

  async getSpecificProperty(id: string, property: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL/${id}/${property}`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESL:', error);
      throw error;
    }
  }

  async updateESL(id: string, data: any) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/ESL/${id}`, data)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error updating ESL:', error);
      throw error;
    }
  }

  async linkEslToProduct(id: string, productId: string) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/ESL/${id}/link/${productId}`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error linking ESL to product:', error);
      throw error;
    }
  }

  async unlinkEslFromProduct(id: string) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/ESL/${id}/unlink`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error unlinking ESL from product:', error);
      throw error;
    }
  }

  async createProduct(data: Product) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/Products`, [data])
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      const response = await this.http
        .delete(`${this.baseUrl}/Products/${id}`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getAllProducts() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products/${id}`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, column: string, value: any) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/Products/${id}/${column}/${value}`)
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }
}
