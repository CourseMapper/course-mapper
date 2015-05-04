# this is an example of an app.
the app structure goes like this:

"App" -> has "Widgets" 

for example, my-course app, will have "my followed courses" widget, which located on `user-profile`, and "my progress" widget, which located on `course` . 

##folder structure: 
here is written as "your-app" as an example

###application logics and models:
`/modules/applications/your-app`
####inside this folder, a must have file called "config.json" must exist

###views:
`/views/your-app`

for example:
```
/views/your-app/widgetA.ejs`
/views/your-app/widgetB.ejs`
```

###static files and js
`/public/your-app`

for example:
```
/public/your-app/js/angular-your-app.js 
/public/your-app/css/your-app.css`
```

###routes:
`/routes/your-app`

for example:
```
/routes/your-app/route.js 
```