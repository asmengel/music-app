# Amazing Playlist Builder!

**What Does It Do?**
The APB allows users to create, save, use, and share playlists, tapped into the worlds most massive collections.

**How Do I Deploy It?**
*Option 1: Users*
Use our interface. Go to http://wearestillunderconstruction.com, and follow the user prompts.

*Option 2: Developers*
Although we allow a minimal direct user interface, our primary goal is creating an API for developers to build amazing custom solutions.  Follow the RESTful endpoint instructions below.  Contact us at http://dontexpectustoreallyanswer.com/contactus if you run into difficulties.

**How Can I Use The APB API?**

| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Public | *load 20 artists with albums and songs* |
````http
localhost:8080/api/music/artists
````


GET
````http
localhost:8080/api/music/songs?song=keyword
````
loads artists with songs that include teal 

GET
````http
localhost:8080/api/music/albums?album=ivory
````
loads artists with albums that include ivory 

4.
create new user
...then...
login
POST
````http
localhost:8080/api/music/artists 
````
````json
{
  "artistName" : "Elvis",
  "albums": [
      { "title" : "Blue Hawaii" }
  ]
}
````
optional
````http
put /api/music/artist/:idjustposted
````
````json
{
  "id" : "idjustposted" ,
  "artistName" : "Elvis Costello"
}
````
````http
get /api/music/artists/:idjustposted 
````
````http
delete /api/music/artists/:idjustposted
````
````http
post /api/music/playlists
````
````json
{
   "playlistName" : "The Best Mix Tape"
}
````
````http
put /api/music/playlists/59ccd497ee7460a5ef248a76
````
````json
{
    "id": "59ccd497ee7460a5ef248a76",
	"playlistName" : "road rage music"
}
````
````http
get /api/music/playlists/59ccd497ee7460a5ef248a76
````
````http
get /api/music/playlists/users/:idfromoneabove
````
vote: NOT WORKING >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


**bold**
```` js
alerts('code block!');
````
regular text

more regular text

```` js
alerts('code block!');
````
quoted line from someone
>who said this?
