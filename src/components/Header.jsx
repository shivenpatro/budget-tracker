import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>Budget Tracker</h1>
      <ThemeToggle />
    </header>
  );
};
