import pandas as pd
import json

def excel_to_json(excel_file, json_file):
    """
    Converts an Excel file (CSV format) to a JSON file.

    Args:
        excel_file (str): Path to the Excel (CSV) file.
        json_file (str): Path to save the JSON file.
    """
    try:
        # Read the CSV file into a pandas DataFrame
        df = pd.read_csv(excel_file)

        # Convert the DataFrame to a JSON string
        json_data = df.to_json(orient='records')

        # Convert the JSON string to a Python object (list of dictionaries)
        data = json.loads(json_data)

        # Write the Python object to a JSON file
        with open(json_file, 'w') as f:
            json.dump(data, f, indent=4) # Use indent for pretty printing

        print(f"Successfully converted {excel_file} to {json_file}")

    except FileNotFoundError:
        print(f"Error: The file {excel_file} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage:
excel_file_path = 'your_excel_file.csv'  # Replace with your CSV file path
json_file_path = 'output.json'  # Replace with your desired output path
excel_to_json(excel_file_path, json_file_path)