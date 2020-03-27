# SLR Chrome Plugin

This repository contains the Chrome Plugin which is used to automatically gather articles for Systematic Literature Review(SLR) projects.

# Usage

## Setup

This Chrome plugin is currently not officially released, which means the following steps need to be carried out in order to use it.

1. Clone the repository: `git clone https://github.com/lit-automation/chrome-plugin.git`
2. Open [Google Chrome](https://www.google.nl/intl/en/chrome/?brand=CHBD&gclid=EAIaIQobChMI_9aXkpW66AIVAlXTCh0BRQZPEAAYASAAEgIMy_D_BwE&gclsrc=aw.ds) and visit: `chrome://extensions/`
3. In the top right corner toggle `Developer mode`
4. In the top left, click `Load unpacked`
5. Select the folder where you've cloned repository
6. Verify the plugin is installed by clicking the plugin icon in the top right corner of your browser

## Getting started 

If you don't have an account yet, you'll need to create one by visiting the [SLR dashboard](https://lit.wimsp.nl/). After you've created an account, you need to signin into the plugin, with your created user and email. 

Currently the plugin supports the following features:
* Create a project
* Edit an existing project
* List and switch between projects
* Gather articles for a search query on a project
* After all articles are gathered on a project you can perform a backwards snowball
  * This can also be done by importing a list of articles as CSV through the [SLR dashboard](https://lit.wimsp.nl/) and visiting the plugin afterwards.

# Contributions

Got any improvements? Feel free to create a Pull request.

# Issues

Any issues? Please create an [Issue](https://github.com/lit-automation/chrome-plugin/issues), or contact me personally at w.j.spaargaren@student.tudelft.nl.

# Related projects

The SLR automation environment consists of three individual tools, including this project.

* [Frontend project](https://github.com/lit-automation/frontend)
* [Backend project](https://github.com/lit-automation/backend)


# License

Licensed under the [MIT](LICENSE) license.

Created by [Wim Spaargaren](https://github.com/wimspaargaren)