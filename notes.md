This github repo contains a json file mapping name to count
For each name, display another thing. 
A backend server that has a “refresh” endpoint. Every 5 minutes the site calls this endpoint, which pulls from the repo
The server also has a “request marble” endpoint. Which pulls from the repo, creates a new branch where the current user’s name maps to a number 1 higher than their current number of marbles, makes a pull request, then switches back to main. 
Upon page reload, call the “refresh” endpoint.
The “refresh” endpoint also ensures that the current username 

========================================================

We need to make one major change: The marble ownerships are not supposed to be listed under the jars. Each owner in marble_ownership.json has their own jar; there is one jar per entry. Each jar has marble_ownership[owner] marbles. "Add marbles" calls the "request marble" endpoint so we don't need two buttons. They do the same thing. Also, before calling "refresh" let's store the current ownership numbers in local storage. If the current user's current marble count changed, notify in large text "You got a new marble!" and show the marble dropping animation for new marbles across all owners. Upon clicking "Add Marble" (right after calling the request marble endpoint), notify the user, "We begged your friends to give you a marble. Be patient now."