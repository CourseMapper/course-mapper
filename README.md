# Course Mapper

### Pre-requisities:
1. MongoDB
2. NodeJS
3. npm

### Install some command line tools
```
sudo npm install -g bower
sudo npm install -g gulp
sudo npm install -g grunt
sudo npm install -g nodemon
```
### This will install the needed modules
```
npm install
bower install

run mongoDB if it is not yet running
```
### Run pre-script compiler
`grunt`

### Run the application
`node ./bin/wwww`

### Create Admin
Once the application running for the first time, you can start adding categories as an admin.
Because this is your first time running the site, you need to create an admin user by visiting this URL in your browser.

But before that, please remove some comments from lines:  of file /routes/accounts.js
```
/*
router.get('/accounts/createAdmin/:username', function (req, res, next) {
    var account = new Account();
    account.createAdmin(req.params.username);
    res.status(200).json({status: true});
});
*/
```

After that modification, please visit this URL in the browser.
Please modify the [username] part to your prefered username, and please make sure make it without the square bracket.

`http://localhost:3000/accounts/createAdmin/[username]`

Once you create this admin, please comment back that codes.

And you can login to the system using your new username and password "1".
Please change your password to a saver one on your profile page.
