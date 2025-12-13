import Papa from 'papaparse';

export interface TrendResult {
    District: string;
    LB_Code: string;
    LB_Name: string;
    Block_Name: string;
    Wards_Declared: number;
    LDF_Seats: number;
    UDF_Seats: number;
    NDA_Seats: number;
    IND_Seats: number;
    Leading_Front: string;
    LDF_Vote_Share: string;
    UDF_Vote_Share: string;
    NDA_Vote_Share: string;
    Total_Voters: number;
    Polled_Voters: number;
    Polling_Percentage: string;
    Candidate_Count: number;
    wardInfo: Record<string, WardInfo>;
}

export interface WardInfo {
    wardNo: string;
    wardName: string;
    winner?: WardCandidate; // If declared
    leading?: WardCandidate; // If leading
    candidates: WardCandidate[];
}

export interface WardCandidate {
    name: string;
    party: string;
    group: string;
    votes: number;
    status: string;
}

export interface LocalBody {
    lb_code: string;
    lb_name_english: string;
    lb_type: string;
    district_name: string;
    total_wards: number;
}

export interface Ward {
    ward_code: string;
    ward_name_english: string;
    ward_no: number;
    lb_code: string;
    total_voters: number;
    male_voters: number;
    female_voters: number;
    other_voters: number;
}

export interface PollingStation {
    ps_no: number;
    ps_name: string;
    ward_code: string;
    lb_code: string;
    total_voters: number;
}

const BASE_URL = import.meta.env.BASE_URL;

export const fetchLocalBodies = async (): Promise<LocalBody[]> => {
    const response = await fetch(`${BASE_URL}data/csv/local_bodies.csv`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const localBodies = data
                    .filter((row) => row['Local Body Code'])
                    .map((row) => ({
                        lb_code: row['Local Body Code'],
                        lb_name_english: row['Local Body Name'],
                        lb_type: row['Local Body Type'],
                        district_name: (() => {
                            const d = row['District'] ? row['District'].trim() : '';
                            let normalized = d.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
                            if (normalized === 'Kasargod') return 'Kasaragod';
                            if (normalized === 'Thiruvanathapuram') return 'Thiruvananthapuram';
                            return normalized;
                        })(),
                        total_wards: parseInt(row['Ward Count'] || '0', 10),
                    }));
                resolve(localBodies);
            },
            error: (error: any) => reject(error),
        });
    });
};

export const fetchWards = async (): Promise<Ward[]> => {
    const response = await fetch(`${BASE_URL}data/csv/wards.csv`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const wards = data
                    .filter((row) => row['Ward Code'])
                    .map((row) => ({
                        ward_code: row['Ward Code'],
                        ward_name_english: row['Ward Name'],
                        ward_no: parseInt(row['Ward Code'].slice(-3), 10),
                        lb_code: row['Local Body Code'],
                        total_voters: parseInt(row['Total'] || '0', 10),
                        male_voters: parseInt(row['Males'] || '0', 10),
                        female_voters: parseInt(row['Females'] || '0', 10),
                        other_voters: parseInt(row['Others'] || '0', 10),
                    }));
                resolve(wards);
            },
            error: (error: any) => reject(error),
        });
    });
};

export const fetchPollingStations = async (): Promise<PollingStation[]> => {
    const response = await fetch(`${BASE_URL}data/csv/polling_stations.csv`);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const stations = data
                    .map((row) => ({
                        ps_no: parseInt(row['PS No'] || '0', 10),
                        ps_name: row['PS Name'] || '',
                        ward_code: row['Ward Code'] || '',
                        lb_code: row['Local Body Code'] || '',
                        total_voters: 0, // Not available in this CSV
                    }))
                    .filter((item) => item.lb_code); // Filter by LB Code instead of PS No
                resolve(stations);
            },
            error: (error: any) => reject(error),
        });
    });
};


import { fetchPartyGroups } from './partyService';

export const fetchTrendResults = async (): Promise<TrendResult[]> => {

    // Fetch party groups first - if this fails, we can fallback to default
    let partyGroups = new Map();
    try {
        partyGroups = await fetchPartyGroups();
    } catch (e) {
        console.warn("Failed to load party groups, defaulting to empty map", e);
    }

    // const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    // const url = `${baseUrl}data/csv/trend_detailed_results_2025.csv`;
    // data gets updated independently
  const url = "https://raw.githubusercontent.com/opendatakerala/LSGD2025-Results-Data/refs/heads/main/trend_detailed_results_2025.csv";


    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch trend results: ${response.status} ${response.statusText}`);
            return [];
        }
        const csvText = await response.text();

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn("Errors parsing trend results CSV:", results.errors);
                    }
                    const rawData = results.data as any[];
                    if (!rawData) {
                        resolve([]);
                        return;
                    }

                    // Aggregate data by LB_Code
                    const lbMap = new Map<string, TrendResult>();
                    const declaredWardsMap = new Map<string, Set<string>>();

                    rawData.forEach(row => {
                        const lbCode = row['LB_Code'];
                        if (!lbCode) return;

                        if (!lbMap.has(lbCode)) {
                            lbMap.set(lbCode, {
                                District: row['District'],
                                LB_Code: lbCode,
                                LB_Name: row['LB_Name'],
                                Block_Name: '',
                                Wards_Declared: 0,
                                LDF_Seats: 0,
                                UDF_Seats: 0,
                                NDA_Seats: 0,
                                IND_Seats: 0,
                                Leading_Front: 'N/A',
                                LDF_Vote_Share: '0%',
                                UDF_Vote_Share: '0%',
                                NDA_Vote_Share: '0%',
                                Total_Voters: 0,
                                Polled_Voters: 0,
                                Polling_Percentage: '0',
                                Candidate_Count: 0,
                                wardInfo: {}
                            });
                            declaredWardsMap.set(lbCode, new Set());
                        }

                        const trend = lbMap.get(lbCode)!;
                        const status = row['Status']?.trim().toLowerCase();
                        const wardNo = String(row['Ward_No']);

                        if (!wardNo) return;

                        if (!trend.wardInfo[wardNo]) {
                            trend.wardInfo[wardNo] = {
                                wardNo: wardNo,
                                wardName: row['Ward_Name'],
                                candidates: []
                            };
                        }

                        const party = row['Party']?.toUpperCase()?.trim() || '';
                        const group = partyGroups.get(party) || 'IND';

                        const candidate: WardCandidate = {
                            name: row['Candidate_Name'],
                            party: party,
                            group: group,
                            votes: row['Votes'],
                            status: row['Status']
                        };

                        trend.wardInfo[wardNo].candidates.push(candidate);

                        // Winner and seats will be calculated after sorting
                        if (status === 'leading') {
                            trend.wardInfo[wardNo].leading = candidate;
                        }
                    });

                    // Finalize counts and determine winners based on VOTES
                    lbMap.forEach((trend, _lbCode) => {
                        let calculatedWardsDeclared = 0;

                        Object.values(trend.wardInfo).forEach(ward => {
                            // Sort candidates by votes (descending)
                            ward.candidates.sort((a, b) => b.votes - a.votes);

                            // Clear any existing status flags
                            ward.candidates.forEach(c => {
                            c.status = ''; // or null / '' depending on your schema
                            });

                            // Highest-vote candidate is the winner (if any)
                            const topCandidate = ward.candidates[0];

                            if (topCandidate && topCandidate.votes > 0) {
                            topCandidate.status = 'won';   // ✅ only this one gets 'won'
                            ward.winner = topCandidate;
                            calculatedWardsDeclared++;

                            const group = topCandidate.group;
                            if (group === 'LDF') trend.LDF_Seats++;
                            else if (group === 'UDF') trend.UDF_Seats++;
                            else if (group === 'NDA') trend.NDA_Seats++;
                            else trend.IND_Seats++;
                            }
                            // If no candidate or all votes are 0, no winner; ward not counted
                        });

                        trend.Wards_Declared = calculatedWardsDeclared;
                        });

                    const aggregatedTrends = Array.from(lbMap.values()).map(trend => {
                        const { LDF_Seats, UDF_Seats, NDA_Seats, IND_Seats } = trend;
                        const maxSeats = Math.max(LDF_Seats, UDF_Seats, NDA_Seats, IND_Seats);

                        let leaders = [];
                        if (maxSeats > 0) {
                            if (LDF_Seats === maxSeats) leaders.push('LDF');
                            if (UDF_Seats === maxSeats) leaders.push('UDF');
                            if (NDA_Seats === maxSeats) leaders.push('NDA');
                            if (IND_Seats === maxSeats) leaders.push('IND');
                        }

                        if (leaders.length === 1) trend.Leading_Front = leaders[0];
                        else if (leaders.length > 1) trend.Leading_Front = 'Hung';
                        else trend.Leading_Front = 'N/A';

                        return trend;
                    });

                    resolve(aggregatedTrends);
                },
                error: (error: any) => {
                    console.error("Error parsing trend results:", error);
                    resolve([]);
                }
            });
        });

    } catch (fetchError) {
        console.error("Unexpected error fetching trend results:", fetchError);
        return [];
    }
};

export const fetchGeoJSON = async (district: string, type: string, name: string) => {
    const url = `${BASE_URL}data/geojson/${district}/${type}/${name}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('GeoJSON not found');
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch GeoJSON for ${name} (${type}, ${district})`, error);
        return null;
    }
};
