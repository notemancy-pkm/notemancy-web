import { writable } from "svelte/store";

// Create a store to track the edit mode state
export const isEditMode = writable(false);

// Function to toggle edit mode
export function toggleEditMode(): void {
	isEditMode.update((value) => !value);
}

// Function to set edit mode to a specific state
export function setEditMode(value: boolean): void {
	isEditMode.set(value);
}
