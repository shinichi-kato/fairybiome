export default class PartIO {
  constructor(obj) {
    if (obj) {
      this.type = obj.type;
      this.behavior = {
        availability: parseFloat(obj.behavior.availability),
        generosity: parseFloat(obj.behavior.generosity),
        retention: parseFloat(obj.behavior.retention),
      };
      this.dict = [...obj.dict];
      this.inDict = {};
      this.outDict = null;
    } else {
      this.type = "recaller";
      this.behavior = {
        availability: 1.0,
        generosity: 0.5,
        retention: 0.4
      };
      this.dict = [{in: ["こんにちは"], out: ["こんにちは"]}];
      this.inDict = {};
      this.outDict = null;
    }
  }

  readObj = (obj) => {
    this.type = obj.type;
    const b = obj.behavior;
    this.behavior.availability = parseFloat(b.availability);
    this.behavior.generosity = parseFloat(b.generosity);
    this.behavior.retention = parseFloat(b.retention);
    this.dict = [...obj.dict];
    this.inDict = null;
    this.outDict = null;
  }

  dump = () => {
    return {
      type: this.type,
      behavior: {
        ...this.behavior
      },
      dict: this.dict
    };
  }
}
