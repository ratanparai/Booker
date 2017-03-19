# Booker
[![Dependency Status](https://gemnasium.com/badges/github.com/ratanparai/Booker.svg)](https://gemnasium.com/github.com/ratanparai/Booker)

Node.js , Redis PubSub, Socket.io , Express, MongoDB Book reading progress tracker.

## Installation Instruction
1. Install [MongoDB](https://www.mongodb.org/) , [Node.js](https://nodejs.org/en/), [Redis](http://redis.io/)
2. Run `mongod`
2. `npm install` to download required packages
3. `npm start` to start the application
4. open [http://localhost:3000](http://localhost:3000) on web-browser

## Features
### Realtime Feed Update
Get realtime update of what frieds are reading! 
![](https://raw.githubusercontent.com/ratanparai/Booker/master/public/images/home/live%20notification.gif)

### Books from Local and Goodreads Database
Book search invoke local and goodreads search. If any new book found by the searched string that is not in the app database, it retrive the book info from goodreads , update app database and then push info to the user 
![](https://raw.githubusercontent.com/ratanparai/Booker/master/public/images/home/local-online-booker.gif)

### Visual Book Reading Progress with Realtime Update
Visual Book reading progress on users profile update realtime as user turn pages!
![](https://raw.githubusercontent.com/ratanparai/Booker/master/public/images/home/progress%20realtime.gif)

### RESTFull API
The RESTFull API allow any ebook reader app to integrate with the booker server. Sample [Booker (Windows only](https://github.com/ratanparai/Booker-desktop)  ebook reader app can be found [here](https://github.com/ratanparai/Booker-desktop)

For API documentation read [WIKI](https://github.com/ratanparai/Booker/wiki) 
