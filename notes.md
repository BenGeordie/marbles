This github repo contains a json file mapping name to count
For each name, display another thing. 
A backend server that has a “refresh” endpoint. Every 5 minutes the site calls this endpoint, which pulls from the repo
The server also has a “request marble” endpoint. Which pulls from the repo, creates a new branch where the current user’s name maps to a number 1 higher than their current number of marbles, makes a pull request, then switches back to main. 
Upon page reload, call the “refresh” endpoint.
The “refresh” endpoint also ensures that the current username 
