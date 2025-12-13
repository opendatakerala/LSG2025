import Papa from 'papaparse';

export const fetchPartyGroups = async (): Promise<Map<string, string>> => {
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    try {
        const response = await fetch(`${baseUrl}data/csv/party_and_group.csv`);
        if (!response.ok) {
            console.warn('Network response was not ok for party groups');
            return new Map();
        }
        const csvText = await response.text();

        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const groupMap = new Map<string, string>();
                    const data = results.data as any[];
                    if (data && Array.isArray(data)) {
                        data.forEach(row => {
                            if (row['Party'] && row['Party Group']) {
                                groupMap.set(row['Party'].trim().toUpperCase(), row['Party Group'].trim().toUpperCase());
                            }
                        });
                    }
                    resolve(groupMap);
                },
                error: (err: any) => {
                    console.error("Error parsing party groups:", err);
                    resolve(new Map());
                }
            });
        });
    } catch (error) {
        console.error("Failed to fetch party groups:", error);
        return new Map();
    }
};
