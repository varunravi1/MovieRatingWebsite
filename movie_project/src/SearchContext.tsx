import React, { createContext, ReactNode, useState } from "react";
interface backDrop {
  aspect_ratio: number;
  height: number;
  width: number;
  file_path: string;
}
interface ProductionCompany {
  id: number;
  logo_path: string;
  name: string;
}
interface Video {
  id: string;
  name: string;
  type: string;
}
interface Movie {
  genre_ids: any[];
  created_by: any[];
  id: number;
  original_title: string;
  poster_path: string;
  backdrop_path: string;
  homepage: string;
  budget: number;
  revenue: number;
  tagline: string;
  original_name: string;
  overview: string;
  genres: any[];
  runtime: number;
  release_date: string;
  original_language: string;
  adult: boolean;
  credits: {
    cast: any[];
    crew: any[];
  };
  images: {
    backdrops: backDrop[];
  };
  production_companies: ProductionCompany[];
  director: string;
  videos: {
    results: Video[];
  };
  trailer: any;
  first_air_date: string;
  last_air_date: string;
  audienceScore: string;
  criticScore: string;
  status: string;
}
interface children {
  children: ReactNode;
}
interface SearchContextType {
  searchResults: Movie[];
  setSearchResults: React.Dispatch<React.SetStateAction<Movie[]>>;
}
// Create the context
export const SearchContext = createContext<SearchContextType>({
  searchResults: [],
  setSearchResults: () => {},
});

// Create the provider component
export const SearchProvider = ({ children }: children) => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);

  return (
    <SearchContext.Provider value={{ searchResults, setSearchResults }}>
      {children}
    </SearchContext.Provider>
  );
};
