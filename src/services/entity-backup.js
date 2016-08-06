module.exports = {
  getEntity: function(type, id) {
    return new Promise(function(resolve, reject) {
      console.log("Returning entity '" + id + "' from the entity service");
      resolve({
        id: 998,
        label: "Star Wars: The Force Awakens",
        franciase: {
          label: "Star Wars",
          url: "/franciase/star-wars"
        },
        year: 2015,
        blurb: "Star Wars: The Force Awakens (also known as Star Wars: Episode VII – The Force Awakens) is a 2015 American epic space opera film directed, co-produced, and co-written by J. J. Abrams. The seventh installment in the main Star Wars film series, it stars Harrison Ford, Mark Hamill, Carrie Fisher, Adam Driver, Daisy Ridley, John Boyega, Oscar Isaac, Lupita Nyong'o, Andy Serkis, Domhnall Gleeson, Anthony Daniels, Peter Mayhew, and Max von Sydow. Produced by Lucasfilm Ltd. and Abrams' Bad Robot Productions and distributed worldwide by Walt Disney Studios Motion Pictures, The Force Awakens is set 30 years after Return of the Jedi; it follows Rey, Finn, and Poe Dameron's search for Luke Skywalker and their fight alongside the Resistance, led by veterans of the Rebel Alliance, against Kylo Ren and the First Order, a successor group to the Galactic Empire.",
        director: {
          label: "JJ Abrams",
          url: "/director/jj-abrams"
        },
        mainStar: {
          label: "Daisy Ridley",
          url: "/actor/daisy-ridley",
          character: "Ray Something"
        },
        genre: {
          label: "Sci-Fi",
          url: "/genre/sci-fi"
        },
        cast: [
          {
            label: "Harrison Ford",
            url: "/actor/harrison-ford"
          },
          {
            label: "Mark Hamill",
            url: "/actor/mark-hamill"
          },
          {
            label: "Carrie Fisher",
            url: "/actor/carrie-fisher"
          },
          {
            label: "Adam Driver",
            url: "/actor/adam-driver"
          },
          {
            label: "Daisy Ridley",
            url: "/actor/daisy-ridley"
          },
          {
            label: "John Boyega",
            url: "/actor/john-boyega"
          },
          {
            label: "Oscar Isaac",
            url: "/actor/oscar-isaac"
          },
          {
            label: "Lupita Nyong'o",
            url: "/actor/lupita-nyong-o"
          },
          {
            label: "Andy Serkis",
            url: "/actor/andy-serkis"
          },
          {
            label: "Domhnall Gleeson",
            url: "/actor/domhnall-gleeson"
          },
          {
            label: "Anthony Daniels",
            url: "/actor/anthony-daniels"
          },
          {
            label: "Peter Mayhew",
            url: "/actor/peter-mayhew"
          },
          {
            label: "Max von Sydow",
            url: "/actor/max-von-sydow"
          }
        ],
        staff: [

        ],
        adjective: "blockbuster"
      });
    });
  }
};
