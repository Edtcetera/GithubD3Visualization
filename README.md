# Live commit history viewer
This web app visualizes the commit history of a Github repository live. Useful when working with others in real-time
to know when teammates have pushed or started a new branch. It will warn contributors when two or more branches are
working on the same file for potential merge-conflicts.

Potential use case:
This tool can be used to determine how well developers work together. If different contributor branches are consistently
working on similar files and are able to merge into master, this suggests that there is a level of collaboration between
said contributors.

***
### Done:
- Get commit history for a repo
- Show commits as SVG circles evenly spaced in canvas
- Pulse animation for SVG circles via D3 library

### TODOs:
- Show branch commit histories
- Visualize branch merges
- Visualize when branches are working on the same files
- Desktop notification when branches are working on the same files for potential merge conflicts