module.exports = {
  getEntity: function(type, id) {
    return new Promise(function(resolve, reject) {
      console.log("Returning entity '" + id + "' from the entity service");
      resolve({
        id: 998,
        label: "Star Wars: The Force Awakens",
        hero: "https://i.ytimg.com/vi/xnSmj6YeSAc/maxresdefault.jpg",
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
            url: "/actor/harrison-ford",
            image: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Harrison_Ford_by_Gage_Skidmore.jpg"
          },
          {
            label: "Mark Hamill",
            url: "/actor/mark-hamill",
            image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Mark_Hamill_by_Gage_Skidmore.jpg"
          },
          {
            label: "Carrie Fisher",
            url: "/actor/carrie-fisher",
            image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Carrie_Fisher_2013.jpg"
          },
          {
            label: "Adam Driver",
            url: "/actor/adam-driver",
            image: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Adam_Driver_by_Gage_Skidmore.jpg"
          },
          {
            label: "Daisy Ridley",
            url: "/actor/daisy-ridley",
            image: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Daisy_Ridley_by_Gage_Skidmore.jpg"
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
