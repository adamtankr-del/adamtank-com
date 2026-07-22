---
title: "I am the world\u2019s shittiest computer programmer"
date: "2026-02-18"
slug: "the-magic-of-ai-is-really-the-magic-of-programming"
originalPath: "/new-blog/2026/2/18/the-magic-of-ai-is-really-the-magic-of-programming"
description: "My reflections on programming and using Claude Code to build anything I've wanted to."
image: "/images/content/80079799-terminal.png"
---
Over the last 15 years I’ve downloaded some version of Python multiple times, paid for courses, read tutorials, and consumed hours of YouTube videos… all to give up in a matter of days.   
  
When I told this to my friends who could actually code, they all responded with some version of ‘well WHY do you want to learn to code?’ (damn you simon sinek). Their advice was to find something I was really excited about building, which would help me push through a project to completion and keep momentum going to continue learning.   
  
At the apex of me trying and failing to program something, my girlfriend at the time (now wife) had seen some ad or post about magic mirrors - basically a computer monitor behind reflective/transparent glass that would display things like the weather, time, news, and other stuff:

Magic Mirror build with raspberry pi

They’re actually pretty cool. What I found even cooler was that if I built one for her, maybe there was a chance she’d be super impressed with me and add a green flag to her mental checkbox of reasons to get engaged.   
  
I started looking up tutorial videos. Bought a raspberry pi. Pulled an old computer monitor out of storage. And started coding.   
  
Fast forward about 8 hours when I ran into some technical issue about how the display wasn’t showing up properly (IIRC, the display wasn’t rotating & sizing the way I wanted it to). I reached out in a magic mirror forum for support, but after hours of back and forth with some poor - and very gracious - soul, we couldn’t figure out what was wrong and I abandoned the project (sorry wife, but i’m very glad you still chose to marry me).  
  
That was the last time I remember trying to code. It was ~2017.   
  
Fast forward to two months ago. Every damn person in my little corner of the internet was - and still is at the time I’m writing this - posting about their open claw & mac mini builds. ChatGPT’s Codex just launched. Anthropic’s Claude Code was taking off like wildfire. Having used chatGPT, Gemini, and Perplexity for a few years and personally experiencing how helpful they’ve been for a variety of tasks (namely copywriting/marketing and image generation), I wanted to see what the hype was all about - but this time from an agentic AI & coding perspective.  
  
Serendipitously, a member of the [Pathless Path](https://pathlesspath.com/) community I’m in made a post that he was opening up 5 spots for people wanting to learn how to use Claude Code. $50 for a one hour session, with the promise of having something usable by the end of it. I SMASHED that sign-up button and a week later was on a google meet w/[Alex Dobrenko](https://botharetrue.substack.com/).   
  
His approach was simple. Tell him about something I did repeatedly for work or fun that would be cool to automate. Ideally something that took hours of time that we could cut down to minutes (or less). A natural fit was my monthly [At Water’s Edge newsletter](/new-blog/2026/2/12/the-secret-water-vault-that-saved-earth). While I enjoy writing it, I did NOT enjoy many parts of the overall process. Namely:  
  
\- Sourcing multiple articles each month that I personally found cool/interesting related to water   
\- Summarizing super academic articles/whitepapers in my voice  
\- Ideating & creating meme formats for the header and footer  
\- Formatting & re-formatting the text so that it could be easily published to my [LinkedIn account](https://www.linkedin.com/in/adamtank/), this site, & [my Substack](https://open.substack.com/pub/adamtank/p/the-secret-water-vault-that-saved?r=kgul&utm_campaign=post&utm_medium=web&showWelcomeOnShare=true).   
  
Alex (quite confidently, I’ll add) said, “let’s do it. by the end of this session we’ll have a skill that will do all of those things, and maybe more.”   
  
My first thought was “what the hell is a skill?” My second was “ehhh okay let’s see.” I was cautiously optimistic. He shared his screen, and pulled up the terminal. It looked something like this:

![](/images/content/52241491-terminal.png)

Windows Powershell running Claude Code

Over the course of the next hour Alex asked me a bunch of questions related to my newsletter. What did my process for writing it look like? What kinds of articles did I look for? Did I have access to past issues I’ve written that we could train Claude on? Where did I post? etc. etc. He then wrote a prompt in Claude that basically summarized all of this, and told it that he wanted to build a ‘skill’ for Claude to run that would effectively automate the most mundane parts of my newsletter writing process. (I’ve since learned a skill is exactly what it sounds like - a skill your computer/Claude has developed to complete certain tasks.)   
  
Every time he chatted with Claude in the terminal and fed it answers to my questions, Claude would then come back with some very insightful (IMO) questions in return. Questions like (i’m paraphrasing, but they were essentially natural language like this):  
  
“How many water related articles should I find each time we work together, and where should I store them on your computer?   
”If you find an article that you want me to save, how do you want to upload that?”  
”Where should the newsletter be saved once it’s formatted?”  
  
Watching Alex go back and forth with Claude was mesmerizing. We entered ‘plan mode’ and Claude created a plan to build the skill. We reviewed each step, confirmed that’s how we wanted the skill to function, and let Claude code it. About 5 minutes later the ‘water-newsletter’ skill was built, and we ran it.   
  
And I’ll be damned if my jaw didn’t hit the desk the first time I saw the output. The articles it found were perfect. The meme ideas were hilarious. And the summaries sounded JUST LIKE HOW I WRITE. Even though I still heavily edit, the skill has saved me at least 5 hours/month.   
  
But what I found especially cool - and still LOVE as I work with Claude - is watching it think, verifying the outputs, and seeing it write lines of code. Even if the code is jibberish to me, I can see what I WANTED TO LEARN to do so many years ago trying to learn to code myself… and it gives me a completely new level of respect for people who’ve actually learned to do it themselves.  
  
Since my session with Alex, I’ve been on a skill-building rampage with Claude. In just a few days, I’ve created:  
  
\- A linkedin network visualizer that takes all of my connections and pins them on a map where they live:

Linkedin Network Visualizer built with Claude Code!

\- A recorded call review and timestamped feedback generator for B2B salespeople, based on consultative sales methodologies I’ve learned and use like Challenger Method, Sandler, and SNAP.  
  
\- [An e-commerce website](https://backwoodprovisions.com) to sell mushroom foraging bags and worm grunting sticks.  
  
\- [A morel mushroom foraging app](https://www.morelfinder.com ) that provides detailed information on where to hunt for morels near you by cataloging weather, public land, host trees, burn sites, and more.  
  
\- Programmatically improved my SEO on this website (maybe you found this article from it!).  
  
\- Automated nutrition plan & meal generator based on fitness goals and macro attainment:  

![](/images/content/68e6a603-nutriplan.png)

Fill out the form and receive a personalized nutrition plan based on your specific fitness goals.

At this point I’m feeling like Bradley Cooper in limitless. Anything is possible. The world feels wide open with potential.   
  
And while I still may be the world’s shittiest computer programmer, I think I’m rapidly becoming a half-decent vibecoder.
