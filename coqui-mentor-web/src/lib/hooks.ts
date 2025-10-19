import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

/**
 * Typed version of useDispatch hook for Redux Toolkit.
 * Use throughout the app instead of plain `useDispatch`.
 *
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(incrementCounter());
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed version of useSelector hook for Redux Toolkit.
 * Use throughout the app instead of plain `useSelector`.
 *
 * @example
 * const user = useAppSelector((state) => state.user);
 */
export const useAppSelector = useSelector.withTypes<RootState>();
