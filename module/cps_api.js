const axios = require('axios');
const rawApi = async data => {
    try {
        const resp = await axios.post('https://api.rescuegroups.org/http/v2.json', data, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
        return resp;
    } catch (error) {
        console.log(error);
    }
};

// I haven't made a module before, so this could probably be made more efficient
module.exports = function(config) {
    let mod = {
        search: (apiKey, perPage, currentPage, results, filters) => {
            let data = {
                apikey: apiKey,
                objectType: 'animals',
                objectAction: 'publicSearch',
                search: {
                    resultStart: currentPage * perPage,
                    resultLimit: perPage,
                    resultSort: 'animalName',
                    resultOrder: 'asc',
                    calcFoundRows: 'Yes',
                    filters: filters,
                    fields: results,
                },
            };
            return rawApi(data);
        },
        searchCps: (perPage, currentPage, results, filters) => {
            filters.push({
                fieldName: 'animalOrgID',
                operation: 'equals',
                criteria: config.orgId,
            });
            filters.push({
                fieldName: 'animalSpecies',
                operation: 'equals',
                criteria: 'Dog',
            });
            return mod.search(config.apiKey, perPage, currentPage, results, filters);
        },
    };
    return mod;
};
