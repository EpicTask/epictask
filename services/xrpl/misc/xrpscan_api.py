import requests

from services.xrpl.models.xrpl_models import AccountHeader, AccountInfo

# xrpscan api url
xrpscan_url = "https://api.xrpscan.com/api/v1"


def xrpscan_get_accountInfo(address):
    try:
        response = requests.get(xrpscan_url + "/account/" + address)
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making the request: {e}")
        return None

    if response.status_code == 200:
        try:
            data = response.json()
            return AccountInfo(**data)
        except ValueError:
            print("Failed to cast JSON response")
            return response.json()
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return None


# Get account balance


def xrpscan_get_accountBalance(address):
    try:
        response = requests.get(xrpscan_url + "/account/" + address)
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making the request: {e}")
        return None

    if response.status_code == 200:
        try:
            data = response.json()
            return data["xrpBalance"]
        except ValueError:
            print("Failed to parse JSON response")
            return None
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return None


# Get account transactions


def xrpscan_get_accountTransactions(address):
    try:
        response = requests.get(
            xrpscan_url + "/account/" + address + "/transactions")
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making the request: {e}")
        return None

    if response.status_code == 200:
        try:
            data = response.json()
            return data
        except ValueError:
            print("Failed to parse JSON response")
            return None
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return None


# Get account escrows


def xrpscan_get_accountEscrows(address):
    try:
        response = requests.get(
            xrpscan_url + "/account/" + address + "/escrows")
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making the request: {e}")
        return None

    if response.status_code == 200:
        try:
            data = response.json()
            return data
        except ValueError:
            print("Failed to parse JSON response")
            return None
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return None
