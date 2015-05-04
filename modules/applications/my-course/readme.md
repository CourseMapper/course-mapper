# this is an example of an app.
the app structure goes like this:

"App" -> has "Widgets" 

for example, my-course app, will have "my followed courses" widget, which located on `user-profile`, and "my progress" widget, which located on `course`. 

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

# before going too far:
before going too far,

!! the only available widget position currently is `user-profile` -- see config file explanation below.

to make it work/able to display your widget, 
you have to change manually(by coding) the `src` attribute of a widget in one of the widget placeholders in the file `/views/admin-lte/profile.ejs`.
please change the `src` to one of the value on the `entryPoint` on one of your widget config entry.

!! this manual coding will be obviously later be automated using a DB

## config file explanation
the filename has to be: `config.json`. and please remove the comments when you are writing your own config file

```
{
  "name": "My Courses", // the name of the app (not the widget). Take it as your 'namespace'
  "description": "", // description of this app generally
  "isActive": "true", // obvious. but will be moved to DB soon. 
  
  // an app will have a collection of widgets, which each of them can act/look differently depending on its location placement
  "widgets":[
    {
      "widgetName": "My Courses List",
      // the enabled location of this widget.
      // at the moment, the options are "user-profile", "node", "course"
      "location": "user-profile", 
      "description": "Will list all your following courses",
      
      // an entry point is to where the ng-include will have on their "src" attribute. 
      // this entry, will resolve to a url e,g: http://localhost:3000/my-course/my-following-courses, in which you should write the handler on your route file.
      "entryPoint": "/my-course/my-following-courses",
      
      // default width and height of this widget. (user can alter their own instance later) 
      "width": 2,
      "height":4,
      
      "isActive": "true",
      
      // put your icon on your static folder. e.g:/public/your-app/ and then write it here
      "icon":"/img/appPlaceholder.png"
    },
    
    // here is an example of a second widget with the same structure
    {
      "widgetName": "My Progress",
      "location": "course",
      "description": "show your overal progress on this particular course",
      "entryPoint": "/my-course/journey",
      "width": 2,
      "height":2,
      "isActive": "true",
      "icon":"/img/appPlaceholder.png"
    }
  ]
}
```