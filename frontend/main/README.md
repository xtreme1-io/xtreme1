# Xtreme1 Frontend main application

main application of Xtreme1, developed width Vue 3 + Typescript + Vite.

## Directory Structure

```
.
├── main
│   .
│   ├── build # Package Script Related
│   │   ├── config # The configuration file
│   │   ├── generate # The generator
│   │   ├── script # script
│   │   └── vite # vite configuration
│   ├── mock # mock about
│   ├── public # Public static resource directory
│   ├── src # main directory
│   │   ├── api # Interface file
│   │   ├── assets # Resource file
│   │   │   ├── icons # icon sprite
│   │   │   ├── images # The folder in which the project stores images
│   │   │   └── svg # The folder where the project holds the SVG images
│   │   ├── components # Common components
│   │   ├── design # The style file
│   │   ├── directives # instruction
│   │   ├── enums # Enumeration/Constant
│   │   ├── hooks # hook
│   │   │   ├── component # Component related hook
│   │   │   ├── core # basic hook
│   │   │   ├── event # event hook
│   │   │   ├── setting # setting hook
│   │   │   └── web # web hook
│   │   ├── layouts # Layout file
│   │   │   ├── default # The default layout
│   │   │   ├── iframe # iframe layout
│   │   │   └── page # page layout
│   │   ├── locales # Language
│   │   ├── logics 
│   │   ├── main.ts # main file
│   │   ├── router # route about
│   │   ├── settings # project settings
│   │   │   ├── componentSetting.ts # Component configuration
│   │   │   ├── designSetting.ts # Style configuration
│   │   │   ├── encryptionSetting.ts # The encryption configuration
│   │   │   ├── localeSetting.ts # Multiple language configuration
│   │   │   ├── projectSetting.ts # Project configuration
│   │   │   └── siteSetting.ts # Site configuration
│   │   ├── store # The data warehouse
│   │   ├── utils # tool function
│   │   └── views # pages
│   ├── types # type file
│   ├── vite.config.ts # vite configuration
│   └── windi.config.ts # windcss configuration
```

## Installation Project Dependence

> yarn

## Start the project in development mode

> yarn dev

## Build

> yarn build

## Set proxy config in `.env.development`

```
// api proxy when development
VITE_PROXY = [["/api",'your api address']]
```
