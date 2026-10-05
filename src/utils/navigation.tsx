import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname,
  navigate: () => {},
  searchParams: new URLSearchParams(window.location.search),
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(window.location.pathname || '/');
    setSearchParams(new URLSearchParams(window.location.search));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ path, navigate, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}> = ({ to, className, children, onClick, title }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <a href={to} className={className} onClick={handleClick} title={title}>
      {children}
    </a>
  );
};
