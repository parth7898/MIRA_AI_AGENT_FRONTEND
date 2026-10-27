import { apiClient } from './axiosClient.js';

const IMAGE_REQUEST = /\b(?:generate|create|make|send|show|share|draw|bhej(?:o|na)?|dikha(?:o)?|bana(?:o)?)\b.{0,60}\b(?:profile\s+)?(?:image|picture|photo|pic|avatar|selfie|tasveer)\b|\b(?:profile\s+)?(?:image|picture|photo|pic|avatar|selfie|tasveer)\b.{0,40}\b(?:generate|create|make|send|show|share|draw|bhej(?:o|na)?|dikha(?:o)?|bana(?:o)?)\b|\bi\s+(?:want|need|would like|wanna)\s+(?:to see\s+)?(?:you|your|ur|u)\s+(?:profile\s+)?(?:image|picture|photo|pic|avatar|selfie)\b|\b(?:can|could)\s+i\s+(?:see|get)\s+(?:you|your|ur|u)\s+(?:profile\s+)?(?:image|picture|photo|pic|avatar|selfie)\b|(?:apni|tumhari|tumhara|apka|aapki)\s+(?:profile\s+)?(?:image|photo|pic|tasveer|तस्वीर|फोटो)\s+(?:bhej|dikha|send|generate|bana)|(?:फोटो|तस्वीर)\s+(?:भेज|दिखा|बना)/i;

export function isImageGenerationRequest(message) {
  return IMAGE_REQUEST.test(message);
}

export async function demoLogin(displayName, password) {
  const { data } = await apiClient.post('/auth/login', { displayName, password });
  return data.data.user;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me');
  return data.data.user;
}

export async function demoLogout() {
  await apiClient.post('/auth/logout');
}

export async function getCompanionHistory() {
  const { data } = await apiClient.get('/companion/history');
  return data.data.messages;
}

export async function saveLanguagePreference(language) {
  const { data } = await apiClient.patch('/companion/profile', { language });
  return data.data.user;
}

export async function sendCompanionMessage({ turnId, message }) {
  const { data } = await apiClient.post('/companion/chat', { turnId, message }, { timeout: 180000 });
  return data.data;
}
