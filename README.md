# student_mark
Helper to mark my student (create docx) and their mark by email.


User case
===
As a teacher I have to correct my student exam.
For each exam I have to:

- Create a docx, fill the students name, surname, email, mark for each sub-subject and the final mark.
- Send the mark to the student
- and finally send all the email to my boss

This piece of software attempt to make my life easier.


How to use
===

1 - Create a docx template
--
![docx template](https://raw.github.com/martin-magakian/student_mark/master/README_src/docx_template.png)

Available tag:

* {date}
* {surname}
* {name}
* {mark}
* {#marks}<br />
     {whatEverTag_4_point}<br />
     {whatEverTag}<br />
  {/marks}

Between the tags {#marks} and {/marks} is the fine description of the mark.
If you create a tag {foo} you have to create an other tag {foo_4_point} where "_4_point" describe the maximum mark of 4.


2 - configure:
---
edit the Config.js file

3 - install dependency
---
$ npm install

7zip module need dependency at the OS level:
https://www.npmjs.com/package/node-7z-esf

For Mac OSX:
$ brew install p7zip


4 - start webserver:
---
$ node index.js --path "/path/to/exam/" --date "2016-10-11" --template "/path/to/template.docx" --subject "Android" --groupe 5

Exam in "/path/to/exam/" should look like this:
* oneStudent@domain.com.zip
* otherStudent@domain.com.txt


5 - Open Web UI
---
![Web UI](https://raw.github.com/martin-magakian/student_mark/master/README_src/UI.png)

