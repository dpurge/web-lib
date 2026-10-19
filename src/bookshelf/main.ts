import './components/bookshelf-app/bookshelf-app';
import { applyStoredTheme } from './theme';

// Done in the same task as the first render, so a remembered theme shows without a flash of the other one.
applyStoredTheme();
