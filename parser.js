const dotenv = require('dotenv');
dotenv.config();
const request = require('request');
const gql = require('graphql-request');
const cheerio = require('cheerio');
const API = process.env.HASURA_URL;
const url = 'https://www.wowprogress.com/pve/ru';

const clearTop = `
mutation clearRaidTop {
    delete_raid_top(where: {}
    ) {
      affected_rows
    }
  }
  
`

const insertTop = `
mutation insert_raid_top($objects: [raid_top_insert_input!]!) {
    insert_raid_top(objects: $objects) {
      returning {
        id
      }
    }
}
`;

const data = [];

request(url, async function (error, res, body) {
    if (!error) {
        const $ = cheerio.load(body);
        const $ratings = $(".ratingContainer .rating tbody tr");
        $ratings.each((index, row) => {
            if (index !== 0) {
                data[index - 1] = {};
                const $row = $(row).children('td');
                $row.each((i, cell) => {
                    $cell = $(cell);
                    switch (i) {
                        case 0: 
                            data[index - 1].place = $cell.children('span').text();
                            break;
                        case 1:
                            data[index - 1].guildName = $cell.find("a nobr").text();
                            const classList = $cell.children('a').attr('class').split(' ');
                            data[index - 1].fraction = classList.includes('horde') ? 'horde' : 'alliance'; 
                            break;
                        case 2:
                            data[index - 1].realm = $cell.find("a").text();
                            break;
                        case 3:
                            data[index - 1].progress = $cell.find("span b").text();
                            break;
                        default:
                            break;
                    }
                });
            }
        });
        await gql.request(API, clearTop);
        await gql.request(API, insertTop, {
            objects: data
        });
    }
});
