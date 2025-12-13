import { useQuery } from "@tanstack/react-query";
import { fetchLocalBodies, fetchTrendResults } from "./dataService";

export const useLocalBody = () => useQuery({
  queryKey: ['localbody'],
  queryFn: fetchLocalBodies
})

export const useTrendResults = () => useQuery({
  queryKey: ['trendresults'],
  queryFn: fetchTrendResults
})
