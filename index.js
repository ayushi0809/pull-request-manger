const axios = require('axios');


/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");
  app.on("pull_request.opened", async (context) => {
    const { owner, repo } = context.repo();
  const pullNumber = context.payload.number;
    console.log(context.log.version);
  // Get the list of files modified in the pull request
  const filesResponse = await context.octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });
  const url = filesResponse.data[0].contents_url;
  console.log(url +" "+2);
  const code_url = await axios.get(url);
  const url_to_code = code_url.data.download_url;
  console.log(url_to_code + "  "+ 1);
  const code = await axios.get(url_to_code);
  console.log(code.data);
  const requestPayload = {
    language : context.payload.pull_request.base.repo.language,
    version : context.log.version,
    files : [
      {
        "name": "test.js",
        "content": code.data
    }
    ]
  }
  console.log(requestPayload);
  //console.log(filesResponse);
  //  console.log(context.payload.pull_request.changed_files);
  //  console.log(context.payload.pull_request.base.repo.language);
   const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
    "language" : context.payload.pull_request.base.repo.language.toLowerCase(),
    "version" : "18.15.0",
     "files" :[{
         "name" : "test.js",
         "content" : code.data
     }
     ]
}
   );
   console.log(response);
   await context.octokit.issues.createComment({
    owner: owner,
    repo: repo,
    issue_number: context.payload.pull_request.number,
    body: "the output of the changed code is \n"+response.data.run.output,
  });
  });

};



