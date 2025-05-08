import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateLocationDto } from './dto/create-location.dto';
import * as https from 'https';

@Injectable()
export class EslService {
  baseUrl: string | undefined = '';
  apiKey: string | undefined = '';
  headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  agent: https.Agent;
  constructor(
    private readonly http: HttpService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('ESL_SERVER_URL');
    this.apiKey = this.configService.get<string>('API_KEY');
    this.headers['x-api-key'] = this.apiKey;
    this.agent = new https.Agent({ rejectUnauthorized: false });
  }

  // ------------ Labels ------------

  async getAllLabels() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/ESL`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .get(`${this.baseUrl}/ESL`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .get(`${this.baseUrl}/ESL/${id}`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .get(`${this.baseUrl}/ESL/${id}/${property}`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .put(`${this.baseUrl}/ESL/${id}`, data, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error updating ESL:', error);
      throw error;
    }
  }

  SOUNDS = {
    PROSSECING: (mac: string) =>
      `${this.baseUrl}/ESL/${mac}/MIDI_SOUND/0/HIGH/procesando:d=8,o=5,b=100:g6,e6,c6,p,g6,e6,c6`,
    COMPLETED: (mac: string) =>
      `${this.baseUrl}/ESL/${mac}/MIDI_SOUND/0/HIGH/completado:d=8,o=5,b=160:c6,e6,g6,p,g6`,
  };

  async emitLabelSound(mac: string, sound: 'PROSSECING' | 'COMPLETED') {
    const response = await this.http
      .post(this.SOUNDS[sound](mac), null, {
        headers: this.headers,
        httpsAgent: this.agent,
      })
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
          httpsAgent: this.agent,
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
          httpsAgent: this.agent,
        })
        .toPromise();
      const response = await this.http
        .post(`${this.baseUrl}/ESL/${id}/link/${locationId}`, null, {
          headers: this.headers,
          httpsAgent: this.agent,
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
          httpsAgent: this.agent,
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
        .put(`${this.baseUrl}/Products`, [data], {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .get(`${this.baseUrl}/Products`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching Locations:', error);
      throw error;
    }
  }

  async getAllLocationsBySorter(sorterID: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
        .toPromise();

      return response?.data?.filter(
        ({ sorter }: { sorter: string }) => sorter === sorterID,
      );
    } catch (error) {
      console.error('Error fetching Locations:', error);
      throw error;
    }
  }

  async getAvailableLocations() {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
        .toPromise();

      return response?.data?.filter(
        ({ orderID }: { orderID: string }) => !!!orderID,
      );
    } catch (error) {
      console.error('Error fetching Locations:', error);
      throw error;
    }
  }

  async getLocationById(id: string) {
    try {
      const response = await this.http
        .get(`${this.baseUrl}/Products/${id}`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async updateLocation(
    id: string,
    column:
      | 'id'
      | 'name'
      | 'productEAN'
      | 'orderID'
      | 'productQuantity'
      | 'pickedQuantity'
      | 'totalQuantity',
    value: number | string,
  ) {
    try {
      const response = await this.http
        .post(
          `${this.baseUrl}/Products/${encodeURIComponent(id)}/${encodeURIComponent(column)}/${encodeURIComponent(value)}`,
          null,
          {
            headers: this.headers,
            httpsAgent: this.agent,
          },
        )
        .toPromise();
      return response?.data;
    } catch (error) {
      // console.error('Error updating product:', error);
      throw error;
    }
  }

  async smartUpdateLocation(
    id: string,
    data: {
      productEAN?: string;
      orderID?: string;
      productQuantity?: number;
      pickedQuantity?: number;
      totalQuantity?: number;
    },
  ) {
    if (!id) {
      throw new Error('ID is required');
    }
    if (data.orderID) {
      this.updateLocation(id, 'orderID', data.orderID);
    }
    if (data.productEAN) {
      this.updateLocation(id, 'productEAN', data.productEAN);
    }
    if (data.productQuantity) {
      this.updateLocation(id, 'productQuantity', data.productQuantity);
    }
    if (data.pickedQuantity) {
      this.updateLocation(id, 'pickedQuantity', data.pickedQuantity);
    }
    if (data.totalQuantity) {
      this.updateLocation(id, 'totalQuantity', data.totalQuantity);
    }
  }

  async deleteLocation(id: string) {
    try {
      const response = await this.http
        .delete(`${this.baseUrl}/Products/${id}`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .get(`${this.baseUrl}/Links`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
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
        .get(`${this.baseUrl}/Links/${id}`, {
          headers: this.headers,
          httpsAgent: this.agent,
        })
        .toPromise();
      return response?.data;
    } catch (error) {
      console.error('Error fetching link:', error);
      throw error;
    }
  }
}
