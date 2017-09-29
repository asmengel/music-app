# Amazing Playlist Builder!

**What Does It Do?**
The APB allows users to create, save, use, and share playlists, tapped into the worlds most massive collections.

**How Do I Deploy It?**
*Option 1: Users*
Use our interface. Go to http://wearestillunderconstruction.com, and follow the user prompts.

*Option 2: Developers*
Although we allow a minimal direct user interface, our primary goal is creating an API for developers to build amazing custom solutions.  Follow the RESTful endpoint instructions below.  Contact us at http://dontexpectustoreallyanswer.com/contactus if you run into difficulties.

**How Can I Use The APB API?**

General:
The APB API uses RESTful endpoints.  Each endpoint below identifies the http method, access level (public requires no credentials, private requires user credentials), and a general description of the method.
Keywords within URIs are indicated via <keyword>.  E.g. to use:
````http
localhost:8080/api/music/songs?song=<keyword>
````
substitute `<keyword>` with `purple` to find all song titles that include purple, per below.
````http
localhost:8080/api/music/songs?song=purple
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| POST     | Public | *create new **user** * |
````http
http://localhost:8080/api/users
````
*User Accounts*
All endpoints identified as "Private" require the user to have a valid APB user accounts.  You can allow users to create accounts from your app. The following 4 fields are required for users to create accounts. Submit this information within the request body as `Content Type` `Application/json`.
````json
{
    "username": "<userentry>",
    "password": "<userentry>",
    "firstName": "<userentry>",
    "lastName": "<userentry>"
}
````
All fields must be strings (e.g. password cannot be all numbers). Usernames and passwords must be explicitly trimmed. Usernames must be unique.  Passwords must be 10-72 characters in length.

Upon successful creation of the user account. Then the user needs to log in.  Redirect the user to a form to enter username and password. The submit function should submit the username & password as follows:
````http
HTTP Header:
Authorization: Basic <base64 encoded usernamepassword>
````
The API APB will respond to a successful login with a JavaScript Web Token.  To access all private endpoints, include the token as follows:
````http
HTTP Header:
Authorization: Bearer <javascript web token>
````

| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Public | *Load 20 artists with albums and songs. Can be useful for teaser content.* |
````http
http://localhost:8080/api/music/artists
````

| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Public | *find **songs** with title that includes keyword* |
````http
http://localhost:8080/api/music/songs?song=<keyword>
````

| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Public | *find **albums** with title that includes keyword* |
````http
http://localhost:8080/api/music/albums?album=<keyword>
````

| Method  | Access | Description |
| ------- |------- | ----------- |
| POST     | Public | *find **albums** with title that includes keyword* |
````http
http://localhost:8080/api/music/artists 
````
````json
{
  "artistName" : "Elvis",
  "albums": [
      { "title" : "Blue Hawaii" }
  ]
}
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| PUT     | Public | *update **artists** by id* |
````http
http://localhost:8080/api/music/artist/<artistId>
````
````json
{
  "id" : "idjustposted" ,
  "artistName" : "Elvis Costello"
}
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Public | *find **artists** by id* |
````http
http://localhost:8080/api/music/artists/<artistId> 
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| DELETE     | Private | *delete **artist** by id* |
````http
http://localhost:8080/api/music/artists/<artistId>
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| POST     | Private | *create a new **playlist** * |
````http
http://localhost:8080/api/music/playlists
````
````json
{
    "id": "<playlist id>",
	"playlistName" : "<playlistname is required>",
	"songs" : [
		{ "title" : "<songs are optional>" ,
		  "_id" : "<id>"
		}
	]
}
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| PUT     | Private | *update **playlist** by id* |
````http
http://localhost:8080/api/music/playlists/<playlistId>
````
Submit the information below in the request body as `Content Type` `Application/json`.
Playlist id is required in the body, but will **NOT** be updated.
Any other information included in the body will be updated.
Invalid requests (other fields, incorrect formatting, etc.) will be rejected.  **IMPORTANT** This function performs a complete replace (delete all, then add all) for any field present in the request body.  If "songs" is present in the request body, then the request body should include **ALL** songs to be used in the playlist, not just a song to add or remove from the playlist.
````json
{
    "id": "<playlist id>",
	"playlistName" : "<playlistname>",
	"songs" : [
		{ "title" : "<title>" ,
		  "_id" : "<id>"
		}
	]
}
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Private | *find **playlist** by id* |
````http
http://localhost:8080/api/music/playlists/<playlistId>
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| GET     | Private | *find **playlists** by user* |
````http
http://localhost:8080/api/music/playlists/users/<userId>
````
| Method  | Access | Description |
| ------- |------- | ----------- |
| PUT     | Private | *increment **votes** of popularity of songs* |
````http
http://localhost:8080/api/music/artists/<artistId>/albums/<albumId>/songs/<songId>
````

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
