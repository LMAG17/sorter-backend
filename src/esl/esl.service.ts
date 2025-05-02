import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class EslService {
  baseUrl: string | undefined = '';
  apiKey: string | undefined = '';
  headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  constructor(
    private readonly http: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('ESL_SERVER_URL');
    this.apiKey = this.configService.get<string>('API_KEY');
    this.headers['x-api-key'] = this.apiKey;
  }

  // ------------ Labels ------------

  async getAllLabels() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESLs:', error);
      throw error;
    }
  }

  async getAvailableLabels() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL`, { headers: this.headers })
        .toPromise();

      return response?.data?.filter(({ ID }: { ID: string }) => !!!ID);
    } catch (error) {
      console.error('Error fetching ESLs:', error);
      throw error;
    }
  }

  async getLabelById(id: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL/${id}`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESL:', error);
      throw error;
    }
  }

  async getSpecificLabelProperty(id: string, property: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL/${id}/${property}`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching ESL:', error);
      throw error;
    }
  }

  async updateLabel(id: string, data: any) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/ESL/${id}`, data, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error updating ESL:', error);
      throw error;
    }
  }

  async emitLabelSound(id: string) {
    const response = await this.http
      .post(
        `${this.baseUrl}/ESL/${id}/SOUND/130/HIGH/1318,1567,2637,2093,2349,3135`,
        null,
        {
          headers: this.headers,
        },
      )
      .toPromise();
    return response;
  }

  async flashLabelLed(
    id: string,
    color: 'RED' | 'GREEN' | 'BLUE' | 'ORANGE' | 'PURPLE' | 'CYAN',
    period: number,
    percentage: number,
    repeatTimes: number,
  ) {
    const response = await this.http
      .post(
        `${this.baseUrl}/ESL/${id}/LED/0/FLASH|${color}/${period}|${percentage}|${repeatTimes}`,
        null,
        {
          headers: this.headers,
        },
      )
      .toPromise();
    return response;
  }

  async linkLabelToLocation(id: string, locationId: string) {
    try {
      await this.http
        .delete(`${this.baseUrl}/ESL/${id}/link`, {
          headers: this.headers,
        })
        .toPromise();
      const response = await this.http
        .post(`${this.baseUrl}/ESL/${id}/link/${locationId}`, null, {
          headers: this.headers,
        })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error linking ESL to product:', error);
      throw error;
    }
  }

  async unlinkLabelAndLocation(id: string) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/ESL/${id}/unlink`, null, {
          headers: this.headers,
        })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error unlinking ESL from product:', error);
      throw error;
    }
  }

  // ------------ Locations ------------

  async createLocation(data: CreateLocationDto) {
    try {
      const response = await this.http
        .put(`${this.baseUrl}/Products`, [data], { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async getAllLocations() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getAllLocationsBySorter(sorterID: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products`, { headers: this.headers })
        .toPromise();

      return response?.data?.filter(
        ({ sorter }: { sorter: string }) => sorter === sorterID,
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getAvailableLocations() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products`, { headers: this.headers })
        .toPromise();

      return response?.data?.filter(
        ({ orderID }: { orderID: string }) => !!!orderID,
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getLocationById(id: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products/${id}`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async updateLocation(
    id: string,
    column: 'id' | 'name' | 'productEAN' | 'orderID' | 'productQuantity',
    value: number | string,
  ) {
    try {
      const response = await this.http
        .post(
          `${this.baseUrl}/Products/${encodeURIComponent(id)}/${encodeURIComponent(column)}/${encodeURIComponent(value)}`,
          null,
          {
            headers: this.headers,
          },
        )
        .toPromise();
      return response?.data;
    } catch (error) {
      // console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteLocation(id: string) {
    try {
      const response = await this.http
        .delete(`${this.baseUrl}/Products/${id}`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ------------ Links ------------

  async getAllLinks() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Links`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw error;
    }
  }

  async getLinkById(id: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Links/${id}`, { headers: this.headers })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching link:', error);
      throw error;
    }
  }
}
