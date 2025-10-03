/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Product {
  id: number;
  name: string;
  imageUrl: string;
}

export interface SavedDesign {
  id: number;
  productImage: string; // dataURL
  productName: string;
  sceneImage: string; // dataURL
  createdAt: string; // ISO string
}
