
import apiClient from './api';
import { BoardMember, BoardMemberRequest, AcknowledgementResponse } from '../types/api';

export const boardMemberService = {
  // Get all board members
  getAllBoardMembers: async (): Promise<BoardMember[]> => {
    const response = await apiClient.get('/api/v1/board-members');
    return response.data;
  },
  
  // Get a specific board member by ID
  getBoardMemberById: async (id: number): Promise<BoardMember> => {
    const response = await apiClient.get(`/api/v1/board-members/${id}`);
    return response.data;
  },
  
  // Create a new board member
  createBoardMember: async (boardMember: BoardMemberRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/board-members', boardMember);
    return response.data;
  },
  
  // Update an existing board member
  updateBoardMember: async (boardMember: BoardMemberRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/update/board-members', boardMember);
    return response.data;
  },
  
  // Delete a board member
  deleteBoardMember: async (id: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/board-members/${id}`);
    return response.data;
  }
};
