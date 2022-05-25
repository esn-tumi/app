# ESN TUMi

The main repository of the websevice that make TUMi work the way it does.
The main code for the TUMi app can be found here together with some other projects like the website for Party Animals.
Additionally there is a new serverside rendered version of the TUMi app and a small projects for experiments.

## Tech Stack

### TUMi Apps (Legacy app + events)

**Client:** Angular, Apollo Angular, Angular Material, TailwindCSS

### Server

**Server:** Node, Express, Graphql Yoga, Prisma, Nexus

### Party Animals

Here there is no specific difference betweeen server and client,
it is built on remix which is based on react.
Also in play is prisma for db connection.

### Experiments

**Client:** Angular, Apollo Angular, TailwindCSS

### Authentication

All the authentication is done with [Auth0](https://auth0.com/docs).

## Projects

As this repo is based on yarn workspaces you can find additional information in the folders for the specific projects.

### What's on `tumi.esn.world`

#### [Legacy App](./legacy-app)

#### [Server](./server)

The server used by all projects but Party Animals for data access

### [Events App](./events)

### [Experiments](./experiments)

### [Party Animals](./party-animals)
