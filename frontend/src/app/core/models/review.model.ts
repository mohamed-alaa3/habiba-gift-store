import { ObjectId } from './api-response.model';
import { User } from './user.model';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * Populated view of a review returned by the API.
 * `user` is populated with just `name` by the backend.
 */
export interface Review {
  _id: ObjectId;
  user: Pick<User, '_id' | 'name'> | ObjectId;
  product: ObjectId;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPayload {
  rating: number;
  comment?: string;
}