if ( process.env.NODE_ENV !== `production` ) require( `dotenv` ).config();

const axios = require( `axios` );

const notionApi = process.env.NOTION_API;
const notionDB = process.env.NOTION_DB;
const todoistApi = process.env.TODOIST_API;

const notionVersion = `2021-05-13`;

async function postToNotion(task) {
    const data = JSON.stringify({
        'parent': {
            'database_id': notionDB
        },
        'properties': {
            'Name': {
            'title': [
                {
                'text': {
                    'content': task
                }
                }
            ]
            }
        }
    });
    
    const config = {
        method: `post`,
        url: `https://api.notion.com/v1/pages`,
        headers: {
            'Authorization': `Bearer ${ notionApi }`,
            'Content-Type': `application/json`,
            'Notion-Version': notionVersion
        },
        data: data
    }
    
    try {
        const res = await axios( config )
        console.log( JSON.stringify( res.data ) );
        return res.status;
    } catch ( err ) {
        console.log( err );
        throw err;
    }
}

async function getTasksFromTodoist() {
    const config = {
        method: `get`,
        url: `https://api.todoist.com/rest/v1/tasks`,
        headers: {
            'Authorization': `Bearer ${ todoistApi }`
        }
    };

    try {
        const res = await axios( config );
        return res.data;
    } catch ( err ) {
        console.log( err );
        throw err;
    }
    
}

(async function() {
    try {
        const tasks = ( await getTasksFromTodoist() ).map( el => el.content );

        const successes = tasks.filter( async ( el ) => {
            const status = await postToNotion( el );
            return status === 200;
        } );

        console.log(successes);
    } catch ( err ) {
        console.log( err );
    }
})();